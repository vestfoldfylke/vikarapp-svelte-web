<script>
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import PersonSearchBar from '../../../components/PersonSearchBar.svelte';
    import Table from '../../../components/Table.svelte';
    import IconSpinner from '../../../components/IconSpinner.svelte';
    import Modal from '../../../components/Modal.svelte';
    import { adminSubsTableData, teacherSubstitutions, teacherTeams } from '../../../lib/helpers/stores'
    import { get } from 'svelte/store';
    import { convertDate } from '../../../lib/helpers/convert-date'
    import { extendSelectedSubstitutions, getVikarToken } from '../../../lib/useApi';

    let pageHeader = 'Her kan du administrere alle vikariater'
    
    let spinner = false
    let isRowSelected = false
    let cleanUp = false
    let showModal = false

    let selectedUserVikar = null
    let selectedUserLaerer = null
    let extendedSubstitutuionsResponse = null

    let substituteData = []
    let teachTeamsData = []
    let tableData = []
    let selected = []
    let teamsToModal = []
    let newSubstitution = []

    const validRoles = ['App.Admin']


    /* 
        Ved valg av lærer gjøres et søk etter læreren sin teams. Disse vises i en tabell.
        Ved valg av vikar gjøres et søk etter vikaren sine vikariat, disse sammenlignes med lærerens teams.
        Dersom den valgte vikaren har et vikariat som matcher en av læreren sin teams vil det vise en status "aktiv" og en utløpsdato.

        Det er også mulig å utvide aktive vikariater eller opprette nye vikariater. Dette gjøres ved å søke opp en lærer og en vikar, velge en rad og trykke på "Aktiver Vikariat".
    */

    const submitSubstitution = async () => {
        // Get the selected teamId from the teachTeamsData matching the team from the selected array with the team from the teachTeamsData array
        const teamsToActivate = selected.map(sub => {
            teamsToModal.push(sub[0])
            return teachTeamsData.find(team => team[0] === sub[0])
        }) 

        spinner = true
        teamsToActivate.forEach(sub => {
            let subObject = {
                substituteUpn: selectedUserVikar.userPrincipalName,
                teacherUpn: selectedUserLaerer.userPrincipalName,
                teamId: sub[2]
            }
            newSubstitution.push(subObject)
        });
        // Call api to start substitution
        pageHeader = 'Aktiverer vikariat...'
        for (const id of newSubstitution) {
            if(import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true'){
                // Pretend to wait for api call
                await new Promise(resolve => setTimeout(resolve, 2000))
                // console.log(`New substitution: ${id}`)
            }
        }
        // Extend selected substitutions
        extendedSubstitutuionsResponse = await extendSelectedSubstitutions(newSubstitution)
        if(extendedSubstitutuionsResponse.status === 201) {
            pageHeader = 'Vikariatet ble opprettet'
            showModal = true
        } else {
            pageHeader = 'Noe gikk galt, prøv igjen'
        }
        // Clean up states
        isRowSelected = false
        spinner = false
        cleanUp = true
        newSubstitution = []
        pageHeader = 'Her kan du administrere alle vikariater'
        goto('/admin/substitute', { replaceState: false, invalidateAll: true })
    }

    // Check for active substitutions for the selected teacher and substitute, if the substitute have an active substitution for the teacher set the team to active and show expiration date.
    // If the teacher have no active substitutions for the selected substitute, do nothing. 
    const handleTableData = async () => {
        // Check if the selected teacher have any active substitutions
        // If the teacherSubstitutions teamId's match the teacherTeams teamId's, set the team to active and show expiration date.
        // If the teacherSubstitutions teamId's do not match the teacherTeams teamId's, do nothing.
        if(substituteData.length >= 0 && teachTeamsData.length >= 0) {
            let teacherSubs = substituteData
            let teacherTeamsData = teachTeamsData
            let data = []
            adminSubsTableData.set([])
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
                adminSubsTableData.update((value) => [...value, [teamName, teamStatus, teamExpiration]])
                data.push([teamName, teamStatus, teamExpiration])
            }
            tableData = data 
        }
    }

    // Hard refresh the page 🤮
    const reloadPage = () => {
        const thisPage = window.location.pathname
        goto('/').then(
            () => {
                goto(thisPage)
            }
        )
    }

    const closeModal = () => {
        showModal = false
        reloadPage()
    }
</script>
<main>
    {#await getVikarToken(true)}
        <div class="loading">
            <IconSpinner width={"32px"} />
        </div>
    {:then token} 
        {#if !token.roles.some((roles) => validRoles.includes(roles))} 
            <div class="center">
                <h2>Her har ikke du rettigheter til å være 🤷‍♂️</h2>
            </div>
            <div class="center">
                <button on:click={ () =>  goto('/')}>Tilbake</button>
            </div>
        {:else}
            <div class="pageHeader">
                <p>{pageHeader}</p>
            </div>
            <div class="tableClass">
                <h2>Vikar{selectedUserVikar === null || selectedUserVikar === undefined ? '' : `: ${selectedUserVikar.displayName} 🎓`}</h2>
                <PersonSearchBar placeHolder={'Søk etter vikar'} funcToTrigger={'getTeacherSubstitutions'} returnSelf={true} params={[selectedUserVikar?.userPrincipalName, undefined, 'active']} bind:dataToReturn={substituteData} bind:selectedUser={selectedUserVikar} bind:spinner={spinner}/>
                <br>
                <h2>Lærer{selectedUserLaerer  === null ? '' : `: ${selectedUserLaerer.displayName} 🎓`}</h2>
                <PersonSearchBar placeHolder={'Søk etter læreren du skal opprette et vikariat for'} funcToTrigger={'getTeacherTeamsData'} returnSelf={true} bind:selectedUser={selectedUserLaerer} bind:dataToReturn={teachTeamsData} bind:spinner={spinner}/>
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
                            <Table data={get(adminSubsTableData)} {cleanUp} rowSelection={true} columnHeaders={['Team', 'Status', 'Utløper']} bind:isRowSelected={isRowSelected} bind:selected={selected}/>
                        {/if}             
                    {/await}
                </div>
                <div class="buttons">
                    {#if isRowSelected}
                        <button on:click={() => {submitSubstitution()}}>Aktiver Vikariat</button>
                    {/if}
                    <button on:click={() => {goto('/', { replaceState: false, invalidateAll: true })}}>Avbryt</button>
                </div>
                <Modal bind:showModal disableClickOutSide={true} disableStandardButton={true}>
                    <h2 slot="header">Vikariat opprettet</h2>
                    <div slot="mainContent">
                        <div class="subs">
                            <p><strong> Vikar: </strong> {selectedUserVikar?.userPrincipalName}</p>
                            <p><strong> Lærer: </strong> {selectedUserLaerer?.userPrincipalName}</p>
                        </div>
                        <hr>
                        <div class="subedTeams">
                            <strong>Team ({teamsToModal.length}):</strong>
                            {#each teamsToModal as sub}
                                <ul>
                                    <li>{sub}</li>
                                </ul>    
                            {/each}
                        </div>
                    </div>
                    <button slot="saveButton" on:click={ () => closeModal()}>Ok</button>
                </Modal>
            {/if}
        {/if}
    {/await}
</main>

<style>
     main {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 70vh;
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