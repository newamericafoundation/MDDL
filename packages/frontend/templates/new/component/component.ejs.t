---
to: 'components/<%=h.changeCase.pascal(name)%>/<%=h.changeCase.pascal(name)%>.vue'
---
<% if (blocks.indexOf('template') !== -1) { %><template>
  <div />
</template>
<%
}

if (blocks.indexOf('script') !== -1) {
%>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class <%= h.changeCase.pascal(name) %> extends Vue {

}
</script>
<%
}

if (blocks.indexOf('style') !== -1) {
%>
<style scoped lang="scss">

</style><%
}
%>
