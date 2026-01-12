import axios from 'axios'
import { getMsalClient, login } from './auth/msal-auth'
import { jwtDecode } from 'jwt-decode'

export const getVikarToken = async (decoded) => {
  // MOCK access token for local api (the access token is just a demo token - nothing dangerous)
  // if (import.meta.env.VITE_MOCK_MSAL === 'true') return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhcGk6Ly9ibGFibGFiIiwiaXNzIjoiaHR0cHM6Ly9kdXN0LmR1c3Rlc2VuLnZ0ZmsubmV0L2hhaGFoLyIsImlhdCI6MTcwNjM2MDM5MiwibmJmIjoxNzA2MzYwMzkyLCJleHAiOjE3MDYzNjU4MjAsImFjciI6IjEiLCJhaW8iOiJiYWJhYmFiYWIiLCJhbXIiOlsicnNhIiwibWZhIl0sInJvbGVzIjpbImR1c3RfYWNjZXNzIiwiYWRtaW5fYWNjZXNzIl0sImFwcGlkIjoiZ3VkZW5lIHZlaXQiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IlNww7hrZWxzZSIsImdpdmVuX25hbWUiOiJEZW1vIiwiaXBhZGRyIjoiMjAwMToyMDIwOjQzNDE6ZmNiYjoyOTU5OjFjNmE6Y2RhYjoyNGUwIiwibmFtZSI6IkRlbW8gU3DDuGtlbHNlIiwib2lkIjoiMTIzNDUiLCJvbnByZW1fc2lkIjoiU1VTVVNVUyIsInJoIjoic2kgc2Vub3IiLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJtYXJpbmUiLCJ0aWQiOiJza2xlbW1lIiwidW5pcXVlX25hbWUiOiJkZW1vLnNwb2tlbHNlQHZlc3Rmb2xkZnlsa2Uubm8iLCJ1cG4iOiJkZW1vLnNwb2tlbHNlQHZlc3Rmb2xkZnlsa2Uubm8iLCJ1dGkiOiJob2hvbyIsInZlciI6IjEuMCJ9.64xzW92dVIXpZ_2OXQ6KQHITtYByDZJn1ycX3p_EkW4'
  let accessToken
  if (!decoded) {
    decoded = false
  }
  try {
    const msalClient = await getMsalClient()
    if (!msalClient.getActiveAccount()) {
      throw new Error('User not logged in yet - waiting for successful login')
    }
    accessToken = (await msalClient.acquireTokenSilent({ scopes: [import.meta.env.VITE_VIKAR_API_SCOPE] })).accessToken
    if (decoded) {
      // Return the decoded token
      const result = {
        upn: '',
        roles: []
      }
      let decodedToken = jwtDecode(accessToken)
      const { upn, roles} = decodedToken
      result.upn = upn || 'appReg'
      result.roles = roles || []

      return result
    }
    return accessToken
  } catch (error) {
    // EN CASE HER ER AT BRUKER har tilgang på frontend men ikke api (app registrering)
    if (error.toString().startsWith('Error: User not logged in yet')) { // Liten frekkas - om bruker ikke er logget inn, kast en error og vent på "vellykket" (hva slags ord skal brukes her egt???) login
      throw error
    }
    // If acquireTokenSilent failed and user is (on the paper/session storage) logged in - we assume the user has been logged out or the refresh token has expired - simply log in again :)
    await login(true) // Sends the user back to main-page, so the search will have to be done again (this should not happen often)
  }
}

const vikarRequest = async (method, endpoint, body) => {
  const accessToken = await getVikarToken()
  const headers = {
    authorization: `Bearer ${accessToken}`
  }
  if (['get', 'delete'].includes(method.toLowerCase())) {
    const res = await axios[method](`${import.meta.env.VITE_VIKAR_API_URI}/${endpoint}`, { headers })
    return { status: res.status, data: res.data }
  } else {
    const res = await axios[method](`${import.meta.env.VITE_VIKAR_API_URI}/${endpoint}`, body, { headers })
    return { status: res.status, data: res.data }
  }
}

// Get Substitutions for a user
export const getSubstitutions = async (substituteUpn, teacherUpn, status, years) => {
  // Setup query parameters
  let queryParams = [];
  if (substituteUpn) queryParams.push(`substituteUpn=${substituteUpn}`)
  if (teacherUpn) queryParams.push(`teacherUpn=${teacherUpn}`)
  if (status) queryParams.push(`status=${status}`)
  if (years) queryParams.push(`years=${years}`)

  let query = '';
  for(let i = 0; i < queryParams.length; i++) {
    query += '&' + queryParams[i]
  }

  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    // const mockData = await import('./helpers/api-mock-data')
    if (substituteUpn === 'marius.netten.skeie@telemarkfylke.no' && status === 'active') return { status: 200, data: mockData.mySubstitutions.filter(sub => sub.status === 'active') }
    if (teacherUpn) return { status: 200, data: mockData.mySubstitutions.filter(sub => sub.teacherUpn === teacherUpn) }
    return { status: 200, data: mockData.mySubstitutions.filter(sub => sub.status === 'expired') }
  }
  return await vikarRequest('get', `substitutions?${query}`)
}

export const getTeacherTeams = async (teacherUpn) => {
  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    // const mockData = await import('./helpers/api-mock-data')
    return { status: 200, data: mockData.teams }
  }
  return await vikarRequest('get', `teacherteams/${teacherUpn}`)
}

export const getUsers = async (searchTerm, returnSelf) => {
  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    // const mockData = await import('./helpers/api-mock-data')
    return { status: 200, data: mockData.users }
  }
  return await vikarRequest('get', `teachers/${searchTerm}/${returnSelf}`)
}

export const extendSelectedSubstitutions = async (substitutions) => {
  if (!substitutions || !Array.isArray(substitutions) || substitutions.length === 0) throw new Error('Cannot renew substitution because no request was provided');
  for (const substitution of substitutions) {
    if (!substitution.substituteUpn) throw new Error(`Cannot renew substitution because 'substituteUpn'-property is missing`)
    if (!substitution.teacherUpn) throw new Error(`Cannot renew substitution because 'teacherUpn'-property is missing`)
    if (!substitution.teamId) throw new Error(`Cannot renew substitution because 'teamId'-property is missing`)
  }
  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    return { status: 200, data: 'Success' }
  }
  return await vikarRequest('post', 'substitutions', substitutions)
}

export const getSchools = async () => {
  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    // const mockData = await import('./helpers/api-mock-data')
    return { status: 200, data: mockData.schools }
  }
  return await vikarRequest('get', 'schools')
}

export const postSchools = async (schoolData) => {
  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    return { status: 200, data: 'Success' }
  }
  return await vikarRequest('post', 'schools', schoolData)
}

export const putSchools = async (id, schoolData) => {
  if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
    return { status: 200, data: 'Success' }
  }
  return await vikarRequest('put', `schools/${id}`, schoolData)
}

// // Get chucky
// export const getChuck = async () => {
//   const res = (await axios.get('https://api.chucknorris.io/jokes/categories')).data
//   return res.map(ele => {
//     return {
//       value: ele,
//       category: 'Et valg'
//     }
//   })
// }
