<script>
  export let title;
  export let x;
  export let y;
</script>

<div style="top: {y + 5}px; left: {x + 5}px;">{title}</div>

<style>
  div {
    border: 1px solid;
    box-shadow: 1px 1px 1px;
    background: white;
    color: black;
    border-radius: 4px;
    padding: 4px;
    position: absolute;
  }
</style>
