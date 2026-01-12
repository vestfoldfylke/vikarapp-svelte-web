<script>
    import '../app.css' // Add global css (and make it hot reload)
    import logoTFK from '$lib/assets/logo.svg'
    import logoVFK from '$lib/assets/vfk_logo.png'
    import favTFK from '$lib/assets/favicon-32x32.png'
    import favVFK from '$lib/assets/vestfold-favicon-32x32.png'
    import { login, logout, getMsalClient } from '../lib/auth/msal-auth'
    // import DusteSearchBar from '../lib/components/DusteSearchBar.svelte'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { getVikarToken } from '../lib/useApi'
    import IconSpinner from '../../src/components/IconSpinner.svelte'
  
    let account = null
    let currentPage = $page.url.pathname
    // console.log('Rett på: ', currentPage)
    // console.log('Fra window: ', window.location.href)
  
    const appTitle = "VikarApp"
    let logo = ""
    let iconPath = ""
    if (import.meta.env.VITE_COUNTY === 'Telemark') {
      logo = logoTFK
      iconPath = favTFK
    } else {
      logo = logoVFK
      iconPath = favVFK
    }
  
    onMount(() => {
      const authenticate = async () => {
        const msalClient = await getMsalClient()
        if (msalClient.getActiveAccount()) {
          account = msalClient.getActiveAccount()
        }
        if (!account) {
          const loginResponse = await login(false, $page.url.pathname) // Sends you to ms auth, and redirects you back here with the msalClient set with active account
          account = loginResponse.account
          if ($page.url.pathname !== loginResponse.loginRequestUrl) {
            goto(loginResponse.loginRequestUrl, { replaceState: false, invalidateAll: true })
          }
        }
      }
      authenticate()   
      
      return () => {
        // console.log('Destroyyyy')
        // on destroy (probs just wipe state)
      }
    })
  
  </script>
    <svelte:head>
      <link rel="icon" type="image/svg" href={iconPath} />
      <title>VikarApp</title>
    </svelte:head>
    {#if !account}
      <div class="loading">
        <IconSpinner width={"32px"} />
      </div>
    {:else}
      {#await getVikarToken(true)}
        <div class="loading">
          <IconSpinner width={"32px"} />
        </div>
      {:then token} 
        <div class="content">
          <div class="header">
            <div class="items">
            {#if $page.url.pathname !== '/'}
              {#if $page.url.pathname.includes('admin/')}
                <button class="link" on:click={() => {goto('/admin')}}><span class="material-symbols-outlined">arrow_back</span>Tilbake</button>
              {:else}
                <button class="link" on:click={() => {goto('/')}}><span class="material-symbols-outlined">arrow_back</span>Tilbake</button>
              {/if}    
            {:else}
              <button class="hidden" on:click={() => {goto('/')}}><span class="material-symbols-outlined">arrow_back</span>Tilbake</button>
            {/if}
            </div>
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="items">
              <h1 on:click={() => {goto('/')}}>{appTitle}</h1>
            </div>
            <div class="items">
              {#if token.roles.includes('App.Admin') || token.roles.includes('App.Config')}
                <button class="link" on:click={() => {goto('/admin', { replaceState: false, invalidateAll: true })}}><span class="material-symbols-outlined">lock</span>Admin</button>
              {/if}
              <button class="link" hidden on:click={() => {goto('/help', { replaceState: false, invalidateAll: true })}}><span class="material-symbols-outlined">settings</span>Innstillinger</button>
            </div>
          </div>
          <div class="appContent">
            <slot></slot>
          </div>
          <div class="footer">
            <img class="logo" src={logo} alt="Fylkekommunens logo" />
          </div>
        </div>
      {/await}
    {/if}

  <style>
    .hidden {
      visibility: hidden;
      max-height: 0;
    }
    .loading {
      width: 100%;
      margin: auto;
    }
    .appTitle {
      color: black;
      text-decoration: none;
    }
    .topbar {
      width: 100%;
      background-color: var(--himmel-10);
      padding: 20px 0px;
    }
    .toptop {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px 40px 40px;
    }
    .topbarOptions {
      float: right;
      display: flex;
      flex-direction: column;
      align-items: self-end;
    }
    .bottomtop {
      width: 100%;
    }
    .logo {
      width: 180px;
    }
    .content {
      display: flex;
      padding: 20px 20px 10px 20px;
      flex-direction: column;
      max-width: 1080px;
      background-color: var(--vann);
      border-radius: 10px;
      margin: 40px auto;
      overflow: hidden;
    }

    .header {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: .5rem;
      margin-bottom: 1rem;
      position: relative;
      width: 100%;
    }
    .header h1 {
      cursor: pointer;
      font-size: 3rem;
      color: #ffcc00;
    }

    .header .items {
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: .5rem;
      margin-top: 1rem;
      position: relative;
      width: 100%;
    }

    .appContent {
      display: flex;
      flex-direction: column;
      background-color: var(--himmel-10);
      width: 100%;
      overflow-y: auto;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 5px 5px 10px 5px rgba(0, 0, 0, 0.1);
    }
  
    @media only screen and (max-width: 768px) {
      /* For mobile phones: */
      .topbar {
        padding: 5px 0px;
      }
      .toptop {
        padding: 5px;
      }
      .appTitle {
        font-size: 10px;
      }
      .logo {
        width: 92px;
      }
      .content {
        padding: 0px;
        width: 100%;
        height: 100%;
        margin: 0;
        border-radius: 0;
      }
      .appContent {
        padding: 1rem;
      }
    }

    @media only screen and (max-width: 420px) {
      .header .items {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-around;
        flex-wrap: wrap;
        margin-top: 0.5rem;
        position: relative;
        width: 100%;
      }
    }
  </style>