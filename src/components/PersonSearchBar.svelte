<script>
    import SearchBar from "./SearchBar.svelte"
    import { getTeacherTeams, getUsers, getSubstitutions } from "../lib/useApi"
    import { teacherTeams, teacherSubstitutions } from '../lib/helpers/stores'
    import { get } from "svelte/store";

    export let placeHolder = "Søk her"
    export let columnHeaders = []
    export let dataToReturn = []
    export let spinner = false
    export let pageHeader = 'Søk opp en lærer og start ett eller flere vikariat'
    export let funcToTrigger = null
    export let selectedUser = null
    export let params = []
    export let returnSelf = false

    let data = []
    
    const searchFunc = async (query) => {
        if(returnSelf) {
            return (await getUsers(query, returnSelf)).data
        } else {
            return (await getUsers(query)).data
        }
        // console.log(query)
        // console.log('Searching for:', query)
    }

    const searchCallback = searchRes => {
        // Do something with the searchCallback if you want
    }

    const getTeacherTeamsData = async (user) => {
        dataToReturn = []
        data = []
        pageHeader = `Henter team for ${user?.displayName}...`
        if(import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true'){
            // Pretend to wait for api call
            spinner = true
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
        spinner = true
        const response = await getTeacherTeams(user?.userPrincipalName)
        if(response.status !== 200) console.error('Error fetching data')
        if(response.data.length > 0) {
            for (const team of response.data) {
                data.push([await team.displayName, await team.description, await team.id])
                dataToReturn = data
                pageHeader = `Viser nå teamene til ${user?.displayName}, velg et eller flere team for å starte vikariat`
            }
            columnHeaders = ['Team', 'Beskrivelse']
            teacherTeams.set(dataToReturn)
        } else {
            pageHeader = `Fant ingen team som tilhører ${user?.displayName}`
        }
        spinner = false
    }

    const getTeacherSubstitutions = async (user, params) => {
        dataToReturn = []
        data = []
        const substituteUpn = user.userPrincipalName 
        const teacherUpn = await params[1] 
        const status = await params[2] 
        const years = await params[3]
        pageHeader = `Henter team for ${user.displayName}...`
        if(import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true'){
            // Pretend to wait for api call
            spinner = true
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
        spinner = true
        const response = await getSubstitutions(substituteUpn, teacherUpn, status, years)
        if(response.status !== 200) console.error('Error fetching data')
        if(response.data.length > 0) {
            for (const sub of response.data) {
                data.push([await sub.teamName, await sub.status, await sub.expirationTimestamp])
                dataToReturn = data
            }
            teacherSubstitutions.set(dataToReturn)
            columnHeaders = ['Team', 'Status', 'Utløper']
            pageHeader = `Her ser du team/klassene til ${user.displayName}, velg et eller flere team for å administrere vikariat`
        }
        spinner = false
    }

    const previewMapper = (input) => {
        return input.map(user => {
            return {
                first: user?.displayName,
                second: user.jobTitle,
                // third: user.company,
                onClick: async () => {
                    // console.log(`Clicked on ${user?.displayName}`)
                    selectedUser = user
                    if(funcToTrigger === 'getTeacherTeamsData') {
                        await getTeacherTeamsData(user)
                    } else if(funcToTrigger === 'getTeacherSubstitutions') {
                        if(params.length > 0) {
                            // Params from array to function arguments
                           await getTeacherSubstitutions(user, params)
                        }
                    } else {
                        console.log('No function to trigger')
                    }
                }
            }
        })
    }
</script>

<div class="personSearchBar">
    <SearchBar rounded={true} debounceMs={1000} showPreview={true} placeholder={placeHolder} search={searchFunc} previewMapper={previewMapper} bind:clearSearchValue={selectedUser}/>
</div>

<style>
  .personSearchBar {
    margin: auto;
    max-width: 800px;
    width: 90vw;
  }
</style>