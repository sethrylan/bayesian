<script lang="ts">
  import { GoogleAnalytics } from '@beyonk/svelte-google-analytics';
  import Calibrate from './Calibrate.svelte';
  import About from './About.svelte';
  import Router from 'svelte-spa-router'

  const routes = {
    '/': Calibrate,
    '/about/': About,
  }
</script>

<svelte:head>
  <title>A tool for calibrated probability estimation</title>
  <html lang="en" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css">
</svelte:head>

<GoogleAnalytics properties={[ 'UA-33138107-1' ]} />

<body>
  <Router {routes}/>
</body>
