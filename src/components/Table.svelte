<!-- SvelteKit table component -->
<script>
    export let data = []
    export let columnHeaders = []
    export let selected = []
    export let editData = []
    export let rowSelection = false
    export let isRowSelected = false
    export let cleanUp = false
    export let action = false
    export let arraysAsLength = false
    export let tableRowToBeEdited = false
    // Action button/header text
    export let actionText = 'Handlinger'
    export let actionTextHeader = 'Handlinger'
    
    let columnHeadersAction = []

    // Toggle checkboxes
    const toggleOneByOne = () => {
        selected = selected.filter((item, index) => selected.indexOf(item) === index)
        selected.length > 0 ? isRowSelected = true :  isRowSelected = false
    }

    // Toggle all checkboxes
    const toggleAll = (e) => {
        selected = e.target.checked ? [...data] : [];
        selected.length > 0 ? isRowSelected = true :  isRowSelected = false
    }

    // Return data when action button is clicked
    const returnData = (row) => {
        editData = row
    }

    // Remove the row that is beeing edited from the data array
    if (tableRowToBeEdited) {
       let rowToBeEditedRemoved = data.filter(school => school[0] !== editData[0])
       data = (rowToBeEditedRemoved)
    }

    // Create a new data array where any data values above the highest index in columnHeaders are removed
    const newData = data.map(row => Object.values(row).slice(0, columnHeaders.length))

    if (action && columnHeaders.length > 0 && !columnHeaders.includes(actionTextHeader))  {
        // Merge columnHeaders and actionTextHeader, quick fix for handling the columnHeaders if we add an action button to the table.
        // When data is updated the columnHeaders.length will be "too long" and we will get data that is not supposed to be there.
        // But that data is needed when we want to do something with the data in the table (like edit or delete)
        columnHeadersAction.push(...columnHeaders)
        columnHeadersAction.push(actionTextHeader)
    }

    if (cleanUp) {
        selected = []
        isRowSelected = false
        cleanUp = false
    }
</script>

{#if data.length === 0}
    <h3>Ingen data funnet</h3>
{:else}
    <table>
        <thead>
            <tr>
                {#if rowSelection}
                    <th class="checkBox"><input type="checkbox" name="selectHeader" on:change={toggleAll} checked={selected.length === data.length}></th>
                {/if}
                {#if action}
                    {#each columnHeadersAction as column}
                        <th>{column}</th>
                    {/each}
                {:else}
                    {#each columnHeaders as column}
                        <th>{column}</th>
                    {/each}
                {/if}
            </tr>
        </thead>
        <tbody>
            {#each newData as row, index}
                <tr>
                    {#if rowSelection}
                        <td align="center" class="checkBox"><input type="checkbox" value={data[index]} name={row} bind:group={selected} on:change={toggleOneByOne}></td>
                    {/if}
                    {#each row as cell}
                        {#if (Array.isArray(cell)) && arraysAsLength}
                            <td>{cell.length}</td> 
                        {:else}
                            <td>{cell}</td>
                        {/if}
                    {/each}
                    {#if action}
                        <td align="center"><button on:click={() => {returnData(data[index])}}>{actionText}</button></td>
                    {/if}
                </tr>
            {/each}
        </tbody> 
    </table>
{/if}

<style>
    .display {
        display: block;
    }
    .hide {
        display: none;
    }
    table, th, td {
        border: 1px solid #ddd;
        border-collapse: collapse;
        margin-bottom: 10px;
    }

    table {
        width: 100%;
    }

    th {
        background-color: var(--himmel-30);
        padding: 10px;
    }

    td {
        padding: 10px;
    }

    tr:hover {
        background-color: #D6EEEE;
    }

    h3 {
        margin: 10px;
        text-align: center;
    }

    .checkBox {
        width: 10px;
    }

    .inputs {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
    }

    @media only screen and (max-width: 768px) {
        table, th, td {
            border: 1px solid #ddd;
            border-collapse: collapse;
            padding: 5px;
            max-width: 1000px;
        }

        th {
            background-color: var(--himmel-30);
            padding: 0.5rem;
        }
    }

    @media only screen and (max-width: 550px) {
        table, th, td {
            font-size: small;
        }
    }

</style>