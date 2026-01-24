<script lang="ts">
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
  <html lang="en"></html>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link href="https://code.highcharts.com/css/highcharts.css" rel="stylesheet">
  <link href="bundle.css" rel="stylesheet">
  <link href="global.css" rel="stylesheet">
</svelte:head>

<Router {routes}/>
