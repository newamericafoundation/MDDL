---
inject: true
to: plugins/store-accessor.ts
before: extractVuexModule insertion point
---
<% const storeName = h.changeCase.camel(name) -%>
  <%= storeName %>Store = getModule(<%= storeName %>, store)