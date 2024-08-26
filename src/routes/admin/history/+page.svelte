<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';

    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import IconSpinner from '../../../components/IconSpinner.svelte';
    import { getVikarToken } from '../../../lib/useApi';

    const pageHeader = 'Historikk'
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
                <!-- // Retreive the data getSubstitutions(selectedSubstitute?.userPrincipalName, selectedTeacher?.userPrincipalName, selectedStatuses, selectedYears) -->
                <p>History skal vise vikariat som er søkt etter</p>
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