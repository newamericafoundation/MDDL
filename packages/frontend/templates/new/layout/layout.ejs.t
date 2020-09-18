---
to: 'layouts/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.vue'
---
<% const componentName = h.changeCase.pascal(name) %>
<template>
  <v-app dark>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class <%= componentName %> extends Vue {}
</script>

<% if (useStyles) { %>
<style scoped lang="scss"></style>
<% } %>
