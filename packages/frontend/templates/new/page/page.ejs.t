---
to: 'pages/<%=h.changeCase.camel(name)%>/index.vue'
---
<% const componentName = h.changeCase.pascal(name) -%>
<template>
  <div />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class <%= componentName %> extends Vue {}
</script>
<% if (useStyles) { %>
<style scoped lang="scss"></style>
<% } %>