<script>
	export let question;
	export let response;
</script>

<div class="card" style="width: 30rem;">
  <div class="card-body text-center">
    <h6 class="card-title">Last question</h6>
    {#if response.correct}
        <h6 class="card-subtitle mb-2 text-primary">correct</h6>
    {:else}
      <h6 class="card-subtitle mb-2 text-warning">incorrect</h6>
    {/if}

    <p class="card-text">{question.options[Object.keys(question.options)[0]].name}: {question.options[Object.keys(question.options)[0]].text}</p>
    <p class="card-text">{question.options[Object.keys(question.options)[1]].name}: {question.options[Object.keys(question.options)[1]].text}</p>
  </div>
</div>
