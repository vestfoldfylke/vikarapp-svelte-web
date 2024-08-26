<script>
    import { onMount } from "svelte";
    import { getVikarToken } from "../../lib/useApi";
    import IconSpinner from "../../components/IconSpinner.svelte";
    import { goto } from '$app/navigation'


    const validRoles = ['App.Config', 'App.Admin']
</script>

{#await getVikarToken(true)}
    <div class="loading">
        <IconSpinner width={"32px"} />
    </div>
{:then token}
    {#if !token.roles.some((roles) => validRoles.includes(roles))}
        <div class="center">
            <h2>Her har ikke du rettigheter til å være 🤷‍♂️</h2>
        </div>
        <button on:click={ () =>  goto('/')}>Tilbake</button>
        {:else}
            <slot></slot>
    {/if}
{/await}


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