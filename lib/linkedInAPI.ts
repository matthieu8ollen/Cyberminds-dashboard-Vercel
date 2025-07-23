export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline: string
  profilePicture?: string
  vanityName?: string
  industry?: string
  location?: string
}

export interface LinkedInPost {
  id: string
  text: string
  publishedAt: string
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS'
  activity: string
  author: string
}

export interface PostMetrics {
  likes: number
  comments: number
  shares: number
  views: number
  clicks: number
  engagement: number
  impressions: number
}

export interface PublishRequest {
  text: string
  visibility?: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS'
  media?: {
    type: 'image' | 'video' | 'document'
    url: string
    title?: string
    description?: string
  }[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  scope: string[]
}

class LinkedInAPIService {
  private readonly CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'your-client-id'
  private readonly CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'your-client-secret'
  private readonly REDIRECT_URI = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || 'http://localhost:3000/auth/linkedin/callback'
  private readonly API_BASE_URL = 'https://api.linkedin.com/v2'
  
  private tokens: AuthTokens | null = null

  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'r_liteprofile',
      'r_emailaddress',
      'w_member_social',
      'r_member_social'
    ]

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: scopes.join(' '),
      state: state || this.generateState()
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string, state?: string): Promise<AuthTokens> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
          code: code
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      const tokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope?.split(' ') || []
      }

      this.setTokens(tokens)
      return tokens
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      throw error
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('linkedin_tokens', JSON.stringify(tokens))
    }
  }

  getTokens(): AuthTokens | null {
    if (this.tokens) return this.tokens

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linkedin_tokens')
      if (stored) {
        try {
          const tokens = JSON.parse(stored) as AuthTokens
          if (tokens.expiresAt > Date.now()) {
            this.tokens = tokens
            return tokens
          } else {
            localStorage.removeItem('linkedin_tokens')
          }
        } catch (error) {
          console.error('Error parsing stored tokens:', error)
          localStorage.removeItem('linkedin_tokens')
        }
      }
    }

    return null
  }

  isAuthenticated(): boolean {
    const tokens = this.getTokens()
    return tokens !== null && tokens.expiresAt > Date.now()
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    const currentTokens = this.getTokens()
    if (!currentTokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: currentTokens.refreshToken,
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || currentTokens.refreshToken,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope?.split(' ') || currentTokens.scope
      }

      this.setTokens(newTokens)
      return newTokens
    } catch (error) {
      console.error('Error refreshing tokens:', error)
      throw error
    }
  }

  async getProfile(): Promise<LinkedInProfile> {
    const tokens = await this.ensureValidTokens()
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/people/~:(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams))`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        firstName: data.firstName?.localized?.en_US || '',
        lastName: data.lastName?.localized?.en_US || '',
        headline: data.headline?.localized?.en_US || '',
        profilePicture: this.extractProfilePictureUrl(data.profilePicture)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  async publishPost(request: PublishRequest): Promise<LinkedInPost> {
    const tokens = await this.ensureValidTokens()
    const profile = await this.getProfile()

    try {
      const postData = {
        author: `urn:li:person:${profile.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: request.text
            },
            shareMediaCategory: request.media && request.media.length > 0 ? 'IMAGE' : 'NONE',
            ...(request.media && request.media.length > 0 && {
              media: request.media.map(m => ({
                status: 'READY',
                description: {
                  text: m.description || ''
                },
                media: m.url,
                title: {
                  text: m.title || ''
                }
              }))
            })
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': request.visibility || 'PUBLIC'
        }
      }

      const response = await fetch(`${this.API_BASE_URL}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Post publishing failed: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      const responseData = await response.json()
      
      return {
        id: responseData.id,
        text: request.text,
        publishedAt: new Date().toISOString(),
        visibility: request.visibility || 'PUBLIC',
        activity: responseData.activity || '',
        author: profile.id
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      throw error
    }
  }

  async getPostMetrics(postId: string): Promise<PostMetrics> {
    const tokens = await this.ensureValidTokens()

    try {
      const response = await fetch(`${this.API_BASE_URL}/socialActions/${postId}`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      if (!response.ok) {
        console.warn('Analytics not available, returning mock data')
        return this.getMockMetrics()
      }

      const data = await response.json()
      
      return {
        likes: data.numLikes || 0,
        comments: data.numComments || 0,
        shares: data.numShares || 0,
        views: data.numViews || 0,
        clicks: data.numClicks || 0,
        engagement: this.calculateEngagement(data),
        impressions: data.numImpressions || 0
      }
    } catch (error) {
      console.error('Error fetching post metrics:', error)
      return this.getMockMetrics()
    }
  }

  async getRecentPosts(limit: number = 10): Promise<LinkedInPost[]> {
    const tokens = await this.ensureValidTokens()
    const profile = await this.getProfile()

    try {
      const response = await fetch(`${this.API_BASE_URL}/shares?q=owners&owners=urn:li:person:${profile.id}&count=${limit}`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.elements?.map((post: any) => ({
        id: post.id,
        text: post.text?.text || '',
        publishedAt: new Date(post.created?.time || Date.now()).toISOString(),
        visibility: 'PUBLIC',
        activity: post.activity || '',
        author: profile.id
      })) || []
    } catch (error) {
      console.error('Error fetching recent posts:', error)
      return []
    }
  }

  async uploadMedia(file: File, description?: string): Promise<string> {
    const tokens = await this.ensureValidTokens()
    
    try {
      const registerResponse = await fetch(`${this.API_BASE_URL}/assets?action=registerUpload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: `urn:li:person:${(await this.getProfile()).id}`,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }]
          }
        })
      })

      if (!registerResponse.ok) {
        throw new Error(`Media registration failed: ${registerResponse.statusText}`)
      }

      const registerData = await registerResponse.json()
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
      const asset = registerData.value.asset

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: file
      })

      if (!uploadResponse.ok) {
        throw new Error(`Media upload failed: ${uploadResponse.statusText}`)
      }

      return asset
    } catch (error) {
      console.error('Error uploading media:', error)
      throw error
    }
  }

  private async ensureValidTokens(): Promise<AuthTokens> {
    let tokens = this.getTokens()
    
    if (!tokens) {
      throw new Error('No authentication tokens available. Please authenticate first.')
    }

    if (tokens.expiresAt - Date.now() < 5 * 60 * 1000) {
      try {
        tokens = await this.refreshAccessToken()
      } catch (error) {
        throw new Error('Token refresh failed. Please re-authenticate.')
      }
    }

    return tokens
  }

  private extractProfilePictureUrl(profilePicture: any): string | undefined {
    try {
