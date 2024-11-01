<script>
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import Modal from '../../../components/Modal.svelte';
    import Table from '../../../components/Table.svelte';
    import { getSchools, getVikarToken, postSchools, putSchools } from '../../../lib/useApi';
    import IconSpinner from '../../../components/IconSpinner.svelte';

    let showModal = false
    let isRowSelected = false
    let isRowSelectedEdit = false
    let cleanUp = false
    let rowSelection = true
    let action = true
    let arraysAsLength = true
    let spinner = false
    let schoolName = ''
    let school = ''
    let actionText = 'Rediger'
    let actionTextHeader = 'Handlinger'
    let pageHeader = 'Her setter du opp hvilke skoler som får lov til å være vikar for hverandre'
    let postSchoolsResponse = null
    let selected = []
    let selectedEdit = []
    let data = []
    $: editData = []

    const columnHeadersModal = ['Skole']
    const columnHeaders = ['Skole', 'Skoler']
    const validRoles = ['App.Admin', 'App.Config']
    
    // Quick fix - just navigate to the same page to get afterNavigate to run
    onMount(async () => {
        // console.log('On mount')
        // console.log($page.url.pathname)        
    })

    afterNavigate(() => {
        // console.log('After navigate')
        // console.log($page.url.pathname)
    })

    // Hard refresh the page 🤮
    const reloadPage = () => {
        console.log('Reloading page')
        const thisPage = window.location.pathname
        goto('/').then(
            () => {
                goto(thisPage)
            }
        )
    }

    const addNewSchool = async () => {
        let schoolIds = []
        if(selected.length > 0 ) {
            selected.forEach(school => {
                schoolIds.push(school[2])
            });
        }
        const schoolObj = {
            name: schoolName,
            permittedSchools: schoolIds
        }
        // Clean up 
        showModal = false
        cleanUp = true
        schoolName = ''
        postSchoolsResponse = await postSchools(schoolObj)
        if(postSchoolsResponse.status === 201) {
           reloadPage()
        } else {
            console.log('Error adding school')
        }
    }

    const getSchoolInfo = async () => {
        // make sure to clear data array and reload the page if there is any data in it 🤮
        if (data.length > 0) {
            reloadPage()
            data = []
        }
        const response = await getSchools()
        if(response.status === 200) {
            for (const school of response.data) {
                data.push([await school.name, await school.permittedSchools, await school._id ])            
            }
        } else {
            console.log('Error fetching schools')
        }
    }

    const openModal = () => {
        // Disable scrolling when modal is open
        document.body.style.overflow = "hidden"
        document.body.style.height = "100%"
        // Clean up
        selected = []
        isRowSelected = false
        cleanUp = true
        showModal = true
    }

    const editSchool = async (selectedFromEditModal, objectDataToBeEdited) => {
        spinner = true
        pageHeader = `Oppdaterer rettigheter for ${objectDataToBeEdited[0]}`
        const permittedSchools = []
        // Get the school ids from the selected schools
        if(import.meta.env.VITE_MOCK_API && import.meta.env.VITE_MOCK_API === 'true'){
                // Pretend to wait for api call
                spinner = true
                await new Promise(resolve => setTimeout(resolve, 2000))
        }
        selectedFromEditModal.forEach(school => {
            permittedSchools.push(school[2])
        })

        await putSchools(objectDataToBeEdited[2], permittedSchools)
        editData = []
        pageHeader = 'Her setter du opp hvilke skoler som får lov til å være vikar for hverandre'
        spinner = false
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
        {#if spinner}
            <div class="center">
                <IconSpinner/>
            </div>
        {:else}
            {#await getSchoolInfo() }
                <div class="center">
                    <IconSpinner/>
                </div>
            {:then}
                <button on:click={() => (openModal())}>Legg til ny skole</button>
                <div class="tableClass">
                    <Table {columnHeaders} {data} {action} {actionText} {actionTextHeader} {cleanUp} {arraysAsLength} bind:editData={editData} />
                </div>
                <!-- Add new school modal -->
                <Modal bind:showModal>
                    <h2 slot="header">Legg til ny skole</h2>
                    <p>Her oppretter du en ny skole</p>
                    <p>Navnet på skolen må være helt likt det som står i companyName i entraID</p>
                    <div class="inputs">
                        <input bind:value={schoolName} type="text" bind:this={school} placeholder="Skriv inn skolens navn"/>
                    </div>
                    <div class="mainContent" slot="mainContent">
                        <Table columnHeaders={columnHeadersModal} {data} {rowSelection} {cleanUp} bind:isRowSelected={isRowSelected} bind:selected={selected}/>
                    </div>
                    <button slot="saveButton" disabled={schoolName.length === 0} on:click={() => addNewSchool()}>Lagre</button>
                </Modal>
                <Modal showModal={editData.length > 0 ? true : false}>
                    <h2 slot="header">Rediger Skole</h2>
                    <p>Her endrer du hvilke skoler lærere på <strong>{editData[0]}</strong> kan være vikar for.</p>
                    <p>Navnet på skolen må være helt likt det som står i companyName i entraID</p>
                    <div class="inputs">
                        <input bind:value={editData[0]} disabled type="text" bind:this={school} placeholder="Skriv inn skolens navn"/>
                    </div>
                    {#if editData[1]?.length > 0}
                        <p style="color: red;"><strong>På grunn av en bug må du legge til disse skolene igjen, selv om de alt har tilgang til å være vikar {editData[0]}.</strong></p>
                        <p style="color: red;"><strong>Om du ikke velger noen skoler og trykker "Lagre" vil du slette de tilgangene som er satt opp for {editData[0]}</strong></p>
                        {#each data as school}
                            {#if editData[1].includes(school[2])}
                                <p><strong>{(school[0])}</strong></p>
                            {/if}
                        {/each}
                    {/if}
                    <div class="mainContent" slot="mainContent">
                        <!-- Remove the selected school from the data array passed to the table in the edit modal, no need to give permisions to the same school you are editing -->
                        <Table columnHeaders={columnHeadersModal} {data} {rowSelection} {cleanUp} tableRowToBeEdited={true} {editData} preSelection={true} bind:isRowSelected={isRowSelectedEdit} bind:selected={selectedEdit}/>
                    </div>
                    <button slot="saveButton" on:click={() => editSchool(selectedEdit, editData)}>Lagre</button>
                </Modal>
            {/await}
        {/if}
    {/if}
{/await}
</main>

<style>
     main {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      height: 70vh;
    }
    .inputs {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
    }
    .pageHeader {
        font-size: 1.1rem;
    }
    .tableClass {
      margin: 10px;
    }
   
</style>