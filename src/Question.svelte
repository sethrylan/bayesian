<script>
import { createEventDispatcher } from 'svelte';

export let question;

const dispatch = createEventDispatcher();

const handleClick = (fact, answer, confidence, hinted) => {
  dispatch('answer', {
    fact,
    answer,
    confidence,
    hinted
  });
};
</script>

<div class="card">
  <div class="card-body text-center">
    <h5 class="card-title text-center p-4">{question.text}</h5>
    <div class="card-text pb-3">
      <div class="p-2 d-inline-block text-right" style="width: 12rem;">
          {question.o1.name}
      </div>
      <div class="align-items-center justify-content-center d-inline-block">
        <button on:click|once={handleClick(question.fact, question.k1, 95, false)}>95%</button>
        <button on:click|once={handleClick(question.fact, question.k1, 85, false)}>85%</button>
        <button on:click|once={handleClick(question.fact, question.k1, 75, false)}>75%</button>
        <button on:click|once={handleClick(question.fact, question.k1, 65, false)}>65%</button>
        <button on:click|once={handleClick(question.fact, question.k1, 55, false)}>55%</button>
        <button on:click|once={handleClick(question.fact, question.k2, 55, false)}>55%</button>
        <button on:click|once={handleClick(question.fact, question.k2, 65, false)}>65%</button>
        <button on:click|once={handleClick(question.fact, question.k2, 75, false)}>75%</button>
        <button on:click|once={handleClick(question.fact, question.k2, 85, false)}>85%</button>
        <button on:click|once={handleClick(question.fact, question.k2, 95, false)}>95%</button>
      </div>
      <div class="p-2 d-inline-block text-left" style="width: 12rem;">
          {question.o2.name}
      </div>
    </div>
  </div>
</div>
