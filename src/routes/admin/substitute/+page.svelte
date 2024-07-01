<script>
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import PersonSearchBar from '../../../components/PersonSearchBar.svelte';
    import Table from '../../../components/Table.svelte';
    import IconSpinner from '../../../components/IconSpinner.svelte';
    import { teacherSubstitutions, teacherTeams } from '../../../lib/helpers/stores'
    import { get } from 'svelte/store';
    import { convertDate } from '../../../lib/helpers/convert-date'


    const pageHeader = 'Her kan du administrere alle vikariater'
    let spinner = false
    let isRowSelected = false
    let selectedUserVikar = null
    let selectedUserLaerer = null

    let substituteData = []
    let teachTeamsData = []
    let tableData = []
    // Quick fix - just navigate to the same page to get afterNavigate to run
    onMount(() => {
        // console.log('On mount')
        // console.log($page.url.pathname)
    })

    /* 
        Ved valg av lærer gjøres et søk etter læreren sin teams. Disse vises i en tabell.
        Ved valg av vikar gjøres et søk etter vikaren sine vikariat, disse sammenlignes med lærerens teams.
        Dersom den valgte vikaren har et vikariat som matcher en av læreren sin teams vil det vise en status "aktiv" og en utløpsdato.

        Det er også mulig å utvide aktive vikariater eller opprette nye vikariater. Dette gjøres ved å søke opp en lærer og en vikar, velge en rad og trykke på "Aktiver Vikariat".
    */

    afterNavigate(() => {
        // console.log('After navigate')
        // console.log($page.url.pathname)
    })

    const submitSubstitution = async () => {
        console.log('Submit substitution')
    }

    // Check for active substitutions for the selected teacher and substitute, if the substitute have an active substitution for the teacher set the team to active and show expiration date.
    // If the teacher have no active substitutions for the selected substitute, do nothing. 
    const handleTableData = async () => {
        // Check if the selected teacher have any active substitutions
        // If the teacherSubstitutions teamId's match the teacherTeams teamId's, set the team to active and show expiration date.
        // If the teacherSubstitutions teamId's do not match the teacherTeams teamId's, do nothing.
        if(get(teacherSubstitutions).length > 0 && get(teacherTeams).length > 0) {
            let teacherSubs = get(teacherSubstitutions)
            let teacherTeamsData = get(teacherTeams)
            let data = []
            for (const team of teacherTeamsData) {
                let teamId = team[0]
                let teamName = team[1]
                let teamDescription = team[2]
                let teamStatus = ''
                let teamExpiration = ''
                for (const sub of teacherSubs) {
                    if(sub[0] === teamId) {
                        teamStatus = 'Aktiv'
                        teamExpiration = convertDate(sub[2])
                    }
                }
                data.push([teamName, teamStatus, teamExpiration])
            }
            tableData = data
        }
    }
</script>
<main>
    <div class="pageHeader">
        <p>{pageHeader}</p>
    </div>
    <div class="tableClass">
        <h2>Vikar{selectedUserVikar === null || selectedUserVikar === undefined ? '' : `: ${selectedUserVikar.displayName} 🎓`}</h2>
        <PersonSearchBar placeHolder={'Søk etter vikar'} funcToTrigger={'getTeacherSubstitutions'} params={[selectedUserVikar?.userPrincipalName, undefined, 'active']} bind:dataToReturn={substituteData} bind:selectedUser={selectedUserVikar} bind:spinner={spinner}/>
        <br>
        <h2>Lærer{selectedUserLaerer  === null ? '' : `: ${selectedUserLaerer.displayName} 🎓`}</h2>
        <PersonSearchBar placeHolder={'Søk etter læreren du skal opprette et vikariat for'} funcToTrigger={'getTeacherTeamsData'} bind:selectedUser={selectedUserLaerer} bind:dataToReturn={teachTeamsData} bind:spinner={spinner}/>
    </div>
    {#if spinner}
        <div class="center">
            <IconSpinner/>
        </div>
    {:else}
        <div class="tableClass">
            {#await handleTableData()}
                <div class="center">
                    <IconSpinner/>
                </div>
            {:then}
                {#if selectedUserLaerer !== null} 
                    <Table data={tableData} rowSelection={true} columnHeaders={['Team', 'Status', 'Utløper']}/>
                {/if}                
            {/await}
        </div>
        <div class="buttons">
            {#if isRowSelected}
                <button on:click={() => {submitSubstitution()}}>Aktiver Vikariat</button>
            {/if}
            <button on:click={() => {goto('/', { replaceState: false, invalidateAll: true })}}>Avbryt</button>
        </div>
    {/if}
</main>

<style>
     main {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
     .buttons {
      display: flex;
      margin-top: auto;
      gap: 1rem;
      flex-wrap: wrap;
      flex-direction: row;
      justify-content: center;
    }
    .pageHeader {
        font-size: 1.1rem;
    }
    .tableClass {
      margin: 10px;
    }
    .center {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        margin-bottom: auto;
    }
    h2 {
      font-size: 2rem;
    }
</style>