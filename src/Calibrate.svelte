<script>
import { onMount, afterUpdate } from 'svelte';
import { responses, questions, current } from './store.js';
import Question from './Question.svelte';
import Feedback from './Feedback.svelte';
import NavBar from './NavBar.svelte';
import Chart, {createChart} from './Chart.svelte';	

let confidenceChart = {};

function drawChart(confidenceSeriesData) {
  confidenceChart.series[0].setData(confidenceSeriesData);
  confidenceChart.series[3].setData(confidenceSeriesData);
}

afterUpdate(() => {
  drawChart(getConfidenceSeriesData())
});
  
onMount(async () => {
  fetch("https://us-central1-bayesian-calibration.cloudfunctions.net/QuestionsV2")
    .then(response => response.json())
    .then(data => {
      questions.set(
        data.map(question => {
          var [k1, k2] = Object.keys(question.options);
          question['k1'] = k1;
          question['k2'] = k2;
          question['o1'] = question.options[k1];
          question['o2'] = question.options[k2];
          return question;
        })
      );
    }).catch(error => {
      console.log(error);
      return [];
    });
  confidenceChart = createChart();
});

function getConfidenceSeriesData() {		
  let data = [];
  for(var i = 55; i <= 95; i += 10) {
    var total = 0;
    var correct = 0;
    $responses.forEach(response => {
      if (response.confidence === i) {
        total += 1;
        correct += response.correct ? 1 : 0;
      }
    });
    data.push({
      x: i, 
      high: i, 
      low: (total === 0 ? i : correct/total*100), 
      y: total, 
      total:total
    });
  }
  return data;
}
  
function handleAnswer(event) {
  $responses.push({
    response: event.detail.answer,
    confidence: event.detail.confidence,
    fact: event.detail.fact,
    correct: (event.detail.fact === event.detail.answer),
    hinted: event.detail.hinted
  });
  $current++;
}
</script>

<NavBar/>

<main>
  {#each $questions as question, i}
    {#if $current === i}
      <div class="d-flex justify-content-center p-3">
        <Question on:answer={handleAnswer} question={question}/>
      </div>
    {/if}
  {/each}

  <div class="d-flex justify-content-center">
    <div id="container" class="w-50"/>
  </div>

  {#if $current > 0}
    <div class="col d-flex justify-content-center">
      <Feedback question={$questions[$current-1]} response={$responses[$current-1]}/>
    </div>
  {/if}
</main>
