<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import { extendSelectedSubstitutions } from '../../lib/useApi'

    // Components 
    import IconSpinner from '../../components/IconSpinner.svelte'
    import Table from '../../components/Table.svelte'
    import PersonSearchBar from '../../components/PersonSearchBar.svelte';

    let pageHeader = 'Søk opp en lærer og start ett eller flere vikariat'
    let data = []
    let columnHeaders = []
    let response = []
    let selected = []
    let newSubstitution = []

    let cleanUp = false
    let isRowSelected = false
    let rowSelection = true
    let spinner = false
    let selectedUser

    afterNavigate(() => {
        // console.log($page.url.pathname)
    })

    const submitSubstitution = async () => {
        spinner = true
        selected.forEach(sub => {
            newSubstitution.push(sub[0])
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
        await extendSelectedSubstitutions(newSubstitution)
        // Clean up states
        isRowSelected = false
        spinner = false
        cleanUp = true
        newSubstitution = []
        pageHeader = 'Søk opp en lærer og start ett eller flere vikariat'
        goto('/', { replaceState: false, invalidateAll: true })
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
        <div class="tableClass">
            <PersonSearchBar placeHolder={'Søk etter læreren du skal være vikar for'} funcToTrigger={'getTeacherTeamsData'} route={'substitute'} bind:selectedUser={selectedUser} bind:dataToReturn={data} bind:columnHeaders={columnHeaders} bind:spinner={spinner} bind:pageHeader={pageHeader}/>
            <br>
            <Table {columnHeaders} {data} {rowSelection} {cleanUp} bind:isRowSelected={isRowSelected} bind:selected={selected}/>
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
</style>