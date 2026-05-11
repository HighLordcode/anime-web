import axios from 'axios'

const BLOGGER_BASE_URL = 'https://www.googleapis.com/blogger/v3'

const bloggerClient = axios.create({
  baseURL: BLOGGER_BASE_URL,
  timeout: 10000
})

interface BloggerPost {
  id?: string
  kind: string
  blog: {
    id: string
  }
  published: string
  updated: string
  url: string
  selfLink: string
  title: string
  content: string
  author: {
    displayName: string
  }
  labels?: string[]
}

interface CreatePostParams {
  title: string
  content: string
  labels?: string[]
  isDraft?: boolean
}

// Obtener posts del blog
export async function getBlogPosts(limit = 25, pageToken?: string) {
  try {
    const params: any = {
      key: process.env.BLOGGER_API_KEY,
      maxResults: limit
    }

    if (pageToken) {
      params.pageToken = pageToken
    }

    const response = await bloggerClient.get(
      `/blogs/${process.env.BLOGGER_BLOG_ID}/posts`,
      { params }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
}

// Obtener post por ID
export async function getBlogPost(postId: string) {
  try {
    const response = await bloggerClient.get(
      `/blogs/${process.env.BLOGGER_BLOG_ID}/posts/${postId}`,
      {
        params: {
          key: process.env.BLOGGER_API_KEY
        }
      }
    )
    return response.data as BloggerPost
  } catch (error) {
    console.error('Error fetching blog post:', error)
    throw error
  }
}

// Buscar posts por label
export async function searchPostsByLabel(label: string, limit = 25) {
  try {
    const response = await bloggerClient.get(
      `/blogs/${process.env.BLOGGER_BLOG_ID}/posts/bypath`,
      {
        params: {
          key: process.env.BLOGGER_API_KEY,
          labels: label,
          maxResults: limit
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('Error searching posts by label:', error)
    throw error
  }
}

// Crear nuevo post (requiere autenticación OAuth)
export async function createBlogPost(
  accessToken: string,
  postData: CreatePostParams
) {
  try {
    const response = await bloggerClient.post(
      `/blogs/${process.env.BLOGGER_BLOG_ID}/posts`,
      {
        kind: 'blogger#post',
        blog: {
          id: process.env.BLOGGER_BLOG_ID
        },
        title: postData.title,
        content: postData.content,
        labels: postData.labels || [],
        published: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    return response.data as BloggerPost
  } catch (error) {
    console.error('Error creating blog post:', error)
    throw error
  }
}

// Actualizar post
export async function updateBlogPost(
  accessToken: string,
  postId: string,
  postData: Partial<CreatePostParams>
) {
  try {
    const response = await bloggerClient.put(
      `/blogs/${process.env.BLOGGER_BLOG_ID}/posts/${postId}`,
      {
        title: postData.title,
        content: postData.content,
        labels: postData.labels
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    return response.data as BloggerPost
  } catch (error) {
    console.error('Error updating blog post:', error)
    throw error
  }
}

// Eliminar post
export async function deleteBlogPost(accessToken: string, postId: string) {
  try {
    await bloggerClient.delete(
      `/blogs/${process.env.BLOGGER_BLOG_ID}/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    return true
  } catch (error) {
    console.error('Error deleting blog post:', error)
    throw error
  }
}

// Obtener OAuth URL para autorización
export function getOAuthURL() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  const scopes = ['https://www.googleapis.com/auth/blogger']

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri!,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Intercambiar código por token
export async function exchangeCodeForToken(code: string) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    })
    return response.data
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    throw error
  }
}
