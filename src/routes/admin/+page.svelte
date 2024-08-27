<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import { getVikarToken } from '../../lib/useApi';

    const pageHeader = 'Administrasjonspanel'
    let token
    // Quick fix - just navigate to the same page to get afterNavigate to run
    onMount(async () => {
        token = await getVikarToken(true)
    })

    afterNavigate(() => {
        // console.log('After navigate')
        // console.log($page.url.pathname)
    })
</script>

<main>
    <div class="pageHeader">
        <p>{pageHeader}</p>
    </div>
    <div class="buttons">
        {#if token?.roles.includes('App.Admin')}
            <button on:click={() => {goto('/admin/substitute', { replaceState: false, invalidateAll: true })}}>Behandle vikariat</button>
            <button hidden on:click={() => {goto('/admin/history', { replaceState: false, invalidateAll: true })}}>Historikk</button>
            <button on:click={() => {goto('/admin/logs', { replaceState: false, invalidateAll: true })}}>Logger</button>
        {/if}
        {#if token?.roles.includes('App.Config') || token?.roles.includes('App.Admin')}
            <button on:click={() => {goto('/admin/schools', { replaceState: false, invalidateAll: true })}}>Behandle søkerettigheter</button>
        {/if}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100vh;
    }
    .buttons {
        display: flex;
        gap: 1rem;
        width: 50%;
        margin-top:calc(35vh - 100px);
        flex-direction: column;
        justify-content: center;

    }
    .pageHeader {
        display: flex;
        font-size: 1.1rem;
    }
</style>