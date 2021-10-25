import { writable, readable } from 'svelte/store';

export const questions = writable([]);
export const confidence = writable([]);
export const responses = writable([]);
export const current = writable(0);
export const confidenceChart = writable({});
export const citations = readable(
  [
    {
      "id": "AlpertRaffia1982",
      "text": "Alpert, Marc, and Howard Raiffa. <a href=\"https://www.cambridge.org/core/books/judgment-under-uncertainty/progress-report-on-the-training-of-probability-assessors/31260BD808E5E66745DB3E426BCDD3B0\">\"A Progress Report on the Training of Probability Assessors.\"</a> In <a href=\"http://www.amazon.com/gp/product/0521284147/\"><i>Judgment Under Uncertainty: Heuristics and Biases</i></a>, edited by Daniel Kahneman, Paul Slovic, and Amos Tversky, 294-305. Cambridge University Press, 1982. <a href=\"http://dx.doi.org/10.1017/CBO9780511809477.022\">http://dx.doi.org/10.1017/CBO9780511809477.022</a>."
    },
    {
      "id": "Gill2005",
      "text": "Gill, C. J. <a href=\"http://www.ncbi.nlm.nih.gov/pmc/articles/PMC557240/pdf/bmj33001080.pdf\">\"Why Clinicians Are Natural Bayesians.\"</a> <i>BMJ</i> 330, no. 7499 (May 7, 2005): 1080-1083. doi:10.1136/bmj.330.7499.1080."
    },
    {
      "id": "GunzelmannGluck2004",
      "text": "Gunzelmann, G., and K.A. Gluck. <a href=\"http://act-r.psy.cmu.edu/papers/710/gunzelmann_gluck-2004.pdf\">\"Knowledge Tracing for Complex Training Applications: Beyond Bayesian Mastery Estimates\"</a> In <i>Proceedings of the Thirteenth Conference on Behavior Representation in Modeling and Simulation</i>, 383-384. Orlando, FL: Simulation Interoperability Standards Organization, 2004."
    },
    {
      "id": "Hubbard2010",
      "text": "Hubbard, Douglas W. <a href=\"http://www.amazon.com/gp/product/0470539399/\"><!--http://www.jpmeloche.com/crr/ebooksclub.org__How_to_Measure_Anything__Finding_the_Value_of_Intangibles_in_Business__Second_Edition.pdf--><i>How to Measure Anything Finding the Value of Intangibles in Business</i></a>. 2ed. Wiley, 2010."
    },
    {
      "id": "Jeffery2002",
      "text": "Jeffery, Richard. <a href=\"http://www.princeton.edu/~bayesway/Book*.pdf\"><i>Subjective Probability: The Real Thing</i></a>. Cambridge University Press, 2002."
    },
    {
      "id": "Kahneman2011",
      "text": "Kahneman, Daniel. <a href=\"http://www.nytimes.com/2011/10/23/magazine/dont-blink-the-hazards-of-confidence.html\">\"Don't Blink! The Hazards of Confidence.\"</a> <i>The New York Times</i>, October 19, 2011, sec. Magazine."
    },
    {
      "id": "KassinFong1999",
      "text": "Kassin, Saul M., and Christina T. Fong. <a href=\"http://web.williams.edu/Psychology/Faculty/Kassin/files/kassin_fong_1999.pdf\">\"'I'm Innocent!': Effects of Training on Judgments of Truth and Deception in the Interrogation Room.\"</a> <i>Law and Human Behavior</i> 23, no. 5 (October 1, 1999): 499-516. doi:10.1023/A:1022330011811."
    },
    {
      "id": "Knight1921",
      "text": "Knight, Frank H. (Frank Hyneman). <a href=\"http://www.amazon.com/gp/product/1602060053/\"><!--http://www.econlib.org/library/Knight/knRUP.html--><i>Risk, Uncertainty and Profit</i></a>. Boston, New York, Houghton Mifflin Company, 1921."
    },
    {
      "id": "LichtensteinFischhoff1978",
      "text": "Lichtenstein, Sarah, and Baruch Fischhoff. <a href=\"http://www.dtic.mil/dtic/tr/fulltext/u2/a069703.pdf\"><i>Training for Calibration</i></a>, November 1978."
    },
    {
      "id": "LichtensteinEtAl1982",
      "text": "Lichtenstein, Sarah, Baruch Fischhoff, and Lawrence D. Phillips. <a href=\"http://www.dtic.mil/dtic/tr/fulltext/u2/a101986.pdf\">\"Calibration of Probabilities: The State of the Art to 1980.\"</a> In <a href=\"http://www.amazon.com/gp/product/0521284147/\"><i>Judgment Under Uncertainty: Heuristics and Biases</i></a>, edited by Daniel Kahneman, Paul Slovic, and Amos Tversky, 306-334. Cambridge, UK: Cambridge University Press, 1982."
    },
    {
      "id": "LindeyEtAl1979",
      "text": "Lindley, D. V., A. Tversky, and R. V. Brown. <a href=\"citations/Lindly_et_al-On_the_Reconciliation_of_Probability_Assessments.pdf\">\"On the Reconciliation of Probability Assessments.\"</a> <i>Journal of the Royal Statistical Society. Series A (General)</i> 142, no. 2 (January 1, 1979): 146-180. doi:10.2307/2345078."
    },
    {
      "id": "Marx2013",
      "text": "Marx, Vivien.  <a href=\"http://www.nature.com/nmeth/journal/v10/n7/full/nmeth.2530.html\">\"Data Visualization: Ambiguity as a Fellow Traveler.\"</a> <i>Nature Methods</i> 10, no. 7 (July 2013): 613-615. doi:10.1038/nmeth.2530."
    },
    {
      "id": "McIntyre2007",
      "text": "McIntyre, M.E. <a href=\"http://www.atm.damtp.cam.ac.uk/mcintyre/mcintyre-thinking-probabilistically.pdf\">\"On Thinking Probabilistically.\"</a> In <i>Extreme Events (Proc. 15th 'Aha Huliko'a Workshop)</i>, 153-161. U. of Hawaii: SOEST, 2007."
    },
    {
      "id": "Oskamp1965",
      "text": "Oskamp, Stuart. <a href=\"citations/Oskamp-Overconfidence_in_Case_Study_Judgements.pdf\">\"Overconfidence in Case-study Judgments.\"</a> <i>Journal of Consulting Psychology</i> 29, no. 3 (1965): 261-265. doi:10.1037/h0022125."
    },
    {
      "id": "Plous1993",
      "text": "Plous, Scott. <a href=\"http://www.amazon.com/gp/product/0070504776/\"><i>The Psychology of Judgment and Decision Making</i></a>. New York: McGraw-Hill, 1993."
    },
    {
      "id": "RadzevickMoore2009",
      "text": "Radzevick, Joseph R., and Don A. Moore. <a href=\"http://www.gsb.stanford.edu/sites/default/files/documents/ob_01_09_moore.pdf\">\"Competing to Be Certain (but Wrong): Social Pressure and Overprecision in Judgment.\"</a> <i>Academy of Management Proceedings</i> 2009, no. 1 (August 1, 2009): 1-6. doi:10.5465/AMBPP.2009.44246308."
    },
    {
      "id": "Silver2012",
      "text": "Silver, Nate. <a href=\"http://www.amazon.com/gp/product/159420411X/\"><i>The Signal and the Noise: Why So Many Predictions Fail - but Some Don't</i></a>. 1ed. Penguin Press HC, The, 2012."
    },
    {
      "id": "Wilson1994",
      "text": "Wilson, Alyson G. <a href=\"http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.71.4909&rep=rep1&type=pdf\">\"Cognitive Factors Affecting Subjective Probability Assessment,\"</a> 1994."
    },
  ]
);
