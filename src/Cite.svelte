<script>
import { citations } from './store';
import { tooltip } from './tooltip';

export let id = "";
const citation = $citations.find(c => c.id === id);
const citationNumber = $citations.indexOf(citation) + 1;
console.log(citation);

</script>

<sup use:tooltip title={citation.id}>{citationNumber}</sup>
