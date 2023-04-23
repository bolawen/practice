<template>
    <div>
      <label for="checkboxA">A</label>
      <input id="checkboxA" type="checkbox"  @change="$emit('change',$event.target.checked)"/>
    </div>
  </template>
  
  <script>
  export default {
    model: {
      prop: 'checked',
      event: 'change'
    },
    props:{
      value: String,
      like: {
        type: String,
      }
    }
  };
  </script>
  