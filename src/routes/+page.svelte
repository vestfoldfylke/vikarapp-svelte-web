<script>
    import { goto } from '$app/navigation'
    import { onMount } from 'svelte';
    import { getSubstitutions, getVikarToken, extendSelectedSubstitutions} from '../lib/useApi'
    import { convertDate } from '../lib/helpers/convert-date'
    import { convertStatus } from '../lib/helpers/convert-status'

    // Components
    import IconSpinner from '../components/IconSpinner.svelte'
    import Table from '../components/Table.svelte'
    
    let pageHeader = 'Her kan du se og fornye dine siste vikariater'
    let isRowSelected = false
    let rowSelection = true
    let spinner = false
    let cleanUp = false
    let response = []
    let selected = []
    let data = []
    let columnHeaders = []

    let token = null

    const getMySubstitutions = async (upn) => {
        // Make sure the list is empty before fetching new data.
        data = []
        response = await getSubstitutions(upn)
        if (response.status !== 200) {
          console.error('Error fetching data')
        }

        if (!response.data || response.data.length === 0) {
            console.log('No substitutions found for user')
            return
        }

        for (const substitution of response.data) {
          data.push({
            statusReadable: convertStatus(substitution.status),
            substituteName: substitution.substituteName,
            teacherName: substitution.teacherName,
            teamName: substitution.teamName,
            expirationTimestamp: convertDate(substitution.expirationTimestamp),
            _id: substitution._id,
            status: substitution.status,
            substituteUpn: substitution.substituteUpn,
            teacherUpn: substitution.teacherUpn,
            teamId: substitution.teamId
          })
        }
        columnHeaders = ['Status', 'Vikar', 'Lærer', 'Klasser', 'Utløper']
    }

    onMount(async () => {
        pageHeader = 'Henter dine vikariater...'

        if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
            // Pretend to wait for api call
            spinner = true
            await new Promise(resolve => setTimeout(resolve, 2000))
        }

        token = await getVikarToken(true)
        spinner = false
        pageHeader = 'Her kan du se og fornye dine siste vikariater'
    })

    const extendSubstitution = async () => {
        let request = []
        pageHeader = 'Forlenger vikariat...'

        // Extend substitution
        for (const sub of selected) {
            if (import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true') {
                // Pretend to wait for api call
                spinner = true
                await new Promise(resolve => setTimeout(resolve, 2000))
                continue;
            }

            spinner = true
            request.push({
                substituteUpn: sub.substituteUpn,
                teacherUpn: sub.teacherUpn,
                teamId: sub.teamId,
                status: sub.status,
                _id: sub._id
            })
        }

        // Inform the user that they are trying to extend a duplicate substitution and/or substitutions with more than 1 unique teacher
        let confirmText = ''
        let uniqueTeachers = []
        let uniqueSubs = []

        // Check if the selected substitutions have more than one unique teacher
        selected.forEach(sub => {
            if(!uniqueTeachers.includes(sub.teacherUpn)) {
                uniqueTeachers.push(sub.teacherUpn)
            }
        })

        // Check if the selected substitutions have more than one unique substitution
        selected.forEach(sub => {
            if(!uniqueSubs.includes(sub._id)) {
                uniqueSubs.push(sub._id)
            }
        })

        if (uniqueTeachers.length > 1 && uniqueSubs.length > 1) {
            confirmText = `Du har valgt vikariater med flere enn en unik lærer og flere vikariater. Er du sikker på at du skal være vikar for: ${uniqueSubs.length} klasser og ${uniqueTeachers.length} lærere? Lærere: 
                ${uniqueTeachers.join(',\n')}
            `
        } else if (uniqueSubs.length > 1) {
            confirmText = `Du har valgt flere vikariater, vil du forlenge ${uniqueSubs.length} vikariater?`
        } else if (uniqueTeachers.length > 1) {
            confirmText = `Du har valgt vikariater med flere enn en unik lærer. Er du sikker på at du skal være vikar for: ${uniqueTeachers.length} lærere? Lærere: 
                ${uniqueTeachers.join(',\n')}`
        } else {
            confirmText = 'Vil du forlenge vikariatet?'
        }

        // If the user confirms the extension, extend the selected substitutions
        if (confirm(confirmText)) {
            await extendSelectedSubstitutions(request)
        }

        isRowSelected = false
        spinner = false
        cleanUp = true
        request = []
        selected = []
        pageHeader = 'Her kan du se og fornye dine siste vikariater'
    }
</script>
<main>
    <div class="pageHeader">
        <p>{pageHeader}</p>
    </div>
    {#if spinner}
        <div class="center">
            <IconSpinner/>
        </div>
    {:else}
    {#if !token}
        <div class="center">
            <IconSpinner/>
        </div>
    {:else}
        {#await getMySubstitutions(token.upn)}
            <div class="center">
                <IconSpinner/>
            </div>
        {:then _}
            {#key response}
                <div class="tableClass">
                    <Table {columnHeaders} {data} {rowSelection} {cleanUp} bind:isRowSelected={isRowSelected} bind:selected={selected}/>
                </div>
            {/key}
            <div class="buttons">
                <button on:click={() => {goto('/substitute', { replaceState: false, invalidateAll: true })}}>Jeg skal være vikar</button>
                {#if isRowSelected}
                    <button on:click={() => {extendSubstitution()}}>Forleng vikariat</button>
                {/if}
                <button hidden on:click={() => {goto('/history', { replaceState: false, invalidateAll: true })}}>Historikk</button>
            </div>
        {/await}
        {/if}
    {/if}
</main>

<style>
    main {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
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
    }
</style>