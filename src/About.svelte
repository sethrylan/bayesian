<script>
  import NavBar from './NavBar.svelte';
  import Cite from './Cite.svelte';
  import { tooltip } from './tooltip';
  import { citations } from './store';
</script>

<NavBar/>

<main>
  <div id="main" class="m-5">
    <p>
      We are terrible guessers.
    </p>

    <p>
      'Guessing' here refers to a properly calibrated probability estimate. If we were to guess the gross domestic earnings of <em>The Goonies</em>, the answer would probably be wrong, not through personal faults, but because the question tests exact domain knowledge. Rephrasing the question:
    <blockquote>
      <p class="m-4">
      &ldquo;What are your high and low estimates for the gross domestic earnings of the <em>The Goonies</em>? What interval estimate of <a href="https://en.wikipedia.org/wiki/Confidence_interval">confidence</a> would you give this range?&rdquo;
      </p>
    </blockquote>

    The answer might be:
    <blockquote>
      <p class="m-4">
      &ldquo;Between $100,000 to $100,000,000, inclusive, with 90% confidence.&rdquo;<sup use:tooltip class="note" title="It's $61,389,680.">[note]</sup>
      </p>
    </blockquote>

    <p>
      Given enough data points in a sufficiently ideal world, the estimated confidence interval would match observed accuracy. In other words, the range estimates given with 90% confidence should be correct 90% of the time<Cite id="AlpertRaffia1982"/>. This changes the exercise from a measurement of trivia knowledge to a measurement of ability to gauge uncertainty.  However, that's rarely the case and we habitually estimate with overconfidence. What we know is about 10-35 percentage points less than what we think we know<Cite id="LichtensteinEtAl1982"/>.
    </p>

    <p>
      Researchers have explored the limits and prejudices of probability estimates, and have a few theories on potential causes<Cite id="Wilson1994"/>.
    <ul>
      <li><a href="http://en.wikipedia.org/wiki/Anchoring">Anchoring</a>: the wording and structure of the questions can decrease epistemic accuracy by up to 53 percentage points<Cite id="LichtensteinEtAl1982"/>.</li>
      <li>Pattern-seeking habits of humans create the illusion of signal where there is only noisy data<Cite id="Silver2012"/>.</li>
      <li><a href="https://scholar.princeton.edu/sites/default/files/kahneman/files/prospect_theory.pdf">Prospect theory</a>: small probabilities are overweighed, especially when attached to high-consequence events<Cite id="Plous1993"/>.</li>
      <li>Our educational training emphasizes algebra and calculus as the end goals, <a href="http://www.ted.com/talks/arthur_benjamin_s_formula_for_changing_math_education.html">not probability and statistics</a>.</li>
      <li>We <a href="http://en.wikipedia.org/wiki/Base_rate_neglect">ignore</a> prior probabilities.</li>
      <li>Many social and professional systems reward overconfidence<Cite id="RadzevickMoore2009"/>.</li>
      <li>In situations determined primarily by chance, we often build narratives<sup class="note" use:tooltip title="The term 'Narrative Fallacy' originates from Taleb:
        &ldquo;The narrative fallacy addresses our limited ability to look at sequences of facts without weaving an explanation into them, or, equivalently, forcing a logical link, an arrow of relationship upon them. Explanations bind facts together. They make them all the more easily remembered; they help them make more sense. Where this propensity can go wrong is when it increases our impression< of understanding.&rdquo;
        &mdash;Nassim Nicholas Taleb, The Black Swan (p63-4)">[note]</sup> to coherently explain the events, giving the illusion of control<Cite id="Kahneman2011"/>. E.g., market fluctuations due to labor reports, portfolio performance due to investment strategies or combat effectiveness predicted by training exercises<sup class="note" use:tooltip title="Narrative building is also used in the benefit of data science: to minimize the effect of 'overfitting', or forcing a quantitative prediction model to prior data (Silver2012, p196).">[note]</sup>.</li>
    </ul>

    <p>
      These biases are to estimation as <a href="http://en.wikipedia.org/wiki/Checker_shadow_illusion">optical illusions</a> are to psychometrics, where a simple change of the problem context causes a predictable change in the perceived reality. In general, humans have a very troubled relationship with uncertainty. We don't understand it instinctually, we don't communicate it well<Cite id="Marx2013"/> and we're willing to pay <Cite id="Plous1993"/><sup>,</sup><Cite id="Knight1921"/> to avoid it.
    </p>

    <p>
      Even if we don't live in a region with legalized gambling or work in a forecasting profession, everyday failures of estimation hurt our quality of life, whether due to inaccurate project estimates, poor investments or being late to the next appointment. We make decisions based on uncertainty and imperfect knowledge, knowing much less than we think we know. As far as ubiquitous problems of human existence, it's right up there with communicable disease<sup class="note" use:tooltip title="&ldquo;No problem in judgement in decision making is more prevalent and more potentially catastrophic than overconfidence. As loving Janis (1982) documented in his work on groupthink, American overconfidence enabled the Japanese to destroy Pearl Harbor in World War II. Overconfidence also played a role in the disastrous decision to launch the U.S. space shuttle Challenger. Before the shuttle exploded on its twenty-fifth mission, NASA's official launch risk estimate was 1 catastrophic failure in 100,000 launches (Feynman, 1988, February). This risk estimate is roughly equivalent to launching the shuttle once per day and expecting to see only one accident in three centuries.&rdquo; (Scott Plous, The Psychology of Judgment and Decision Making p217)">[note]</sup>.
    </p>

    <p>
      More importantly, inability to accurately estimate closes the door to powerful tools of probabilistic thinking<Cite id="Jeffery2002"/>. With accurate prior probabilities, Bayesian prediction avoids the nuances of frequentist statistics, while allowing our mental model to adapt as the facts change. It's something which the Army<Cite id="LichtensteinFischhoff1978"/> and Air Force<Cite id="GunzelmannGluck2004"/> train, and M.D.s understand through years of experience<Cite id="Gill2005"/><sup> ,</sup><Cite id="LindeyEtAl1979"/>. Along with the <a href="http://en.wikipedia.org/wiki/Speed#Definition">distance-rate-time</a> equation, <a href="http://en.wikipedia.org/wiki/Time_value_of_money#Formula">time-value</a> equation and <a href="http://en.wikipedia.org/wiki/Logical_equality#Alternative_descriptions">logical equalities</a>, <a href="http://en.wikipedia.org/wiki/Bayes_theorem">Bayes' Theorem</a> is one of the those unreasonably effective structures of math, which internalizing will vastly improve our thinking<Cite id="McIntyre2007"/>.
    </p>

    Overconfidence follows a predictable pattern. Overconfidence is common for difficult assessments (although slightly less for true/false tests<Cite id="Hubbard2010"/><sup> (p64.)</sup>). In some cases, very easy questions inspire underconfidence<Cite id="LichtensteinEtAl1982"/>. Two simple calibration techniques can help to correct this:
    <ul>
      <li>Consider the reasons why the judgment might be wrong <Cite id="Plous1993"/><sup> (p228.)</sup>.</li>
      <li>Range estimates can reduce the anchoring effect of a point estimate, particularly by working towards a narrow range from an absurdly large range<Cite id="Hubbard2010"/><sup> (p64-5.)</sup>.</li>
    </ul>
    Things that don't fix overconfidence:
    <ul>
      <li>More information. Paradoxically, providing more information to the problem increases one's confidence in the answer, but not accuracy<Cite id="KassinFong1999"/><sup>, </sup><Cite id="Oskamp1965"/>.</li>
    </ul>

    <p>
      Most importantly, feedback and iterative practice allow us to improve our estimation techniques<Cite id="LichtensteinEtAl1982"/>, which is the purpose of this project. Select the number of questions and the quiz will give instant feedback on your progress. When choosing your confidence level, 95% confidence indicates almost certainty of the correct answer. 55% is almost a toss-up. The line on the chart shows perfect confidence calibration. Anything above the line is underconfidence (e.g., we thought we'd be correct 75% of the time, but actually we were correct more often). Anything below the line is overconfidence.
    </p>

    <p class="text-center">
      <img alt="probability distribution" src="images/distribution_highcharts.png">
    </p>

    <p>
      The more questions have been answered, the more reliable the results will be.
    </p>

    <h4 class="pt-4">Other examples</h4>

    <ul>
      <li>A <a href="http://lesswrong.com/lw/1f8/test_your_calibration/">list</a> of them.</li>
      <li>An <a href="http://calibratedprobabilityassessment.org">automated quiz</a> that produces a <a href="http://calibratedprobabilityassessment.org/graph.php?y=0.28571428571429-0.90909090909091-0.75-1-1&x=55-65-75-85-95">nifty graph</a>.</li>
      <li>A <a href="http://messymatters.com/calibration/">range estimate quiz</a> reproduced from <a href="http://www.amazon.com/gp/product/0671726099/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0671726099&linkCode=as2&tag=sethrylan-20"><em>Decision Traps</em></a>, and also in Plous's book<Cite id="Plous1993"/>.</li>
    </ul>

    <h4 class="pt-4">Sources</h4>

    {#each $citations as citation}
    <div class="csl-entry" id={citation.id}>{@html citation.text}</div>
    {/each}

  </div>
</main>

<style>
  .csl-entry {
  padding-left: 22px;
  text-indent: -22px;
  }
      
  ul { margin: 0; padding: 5px 0px 7px 20px; }
  li { margin-bottom: 2px; }
</style>