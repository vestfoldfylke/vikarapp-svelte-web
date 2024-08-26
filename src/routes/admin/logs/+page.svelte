<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import { getVikarToken } from '../../../lib/useApi';
    import IconSpinner from '../../../components/IconSpinner.svelte';

    const pageHeader = 'Logger over handliger i VikarApp'
    const validRoles = ['App.Admin']
    
    // Quick fix - just navigate to the same page to get afterNavigate to run
    onMount(() => {
        // console.log('On mount')
        // console.log($page.url.pathname)
    // goto(`/`, {  replaceState: false })
    })

    afterNavigate(() => {
        // console.log('After navigate')
        // console.log($page.url.pathname)
    })
    
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
                <p>Her kommer en tabell eller noe sånt som viser logger over spørringer.</p>
                <p>Tabellen skal inneholde "Type", "start/finished timeStamp", "endpoint", "requestor.name", "durration" og en knapp som viser hele dokumentet fra mongodb i en modal</p>
            </div>
        {/if}
    {/await}   
</main>

<style>
    .loading {
      width: 100%;
      margin: auto;
    }

    .center {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
</style>