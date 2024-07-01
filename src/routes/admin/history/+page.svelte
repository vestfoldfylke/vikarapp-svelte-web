<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'

    const pageHeader = 'Historikk'
    
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
    <div class="pageHeader">
        <p>{pageHeader}</p>
    </div>
</main>