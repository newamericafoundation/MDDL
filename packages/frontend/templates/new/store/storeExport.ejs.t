---
inject: true
to: utils/store-accessor.ts
before: export insertion point
---
<% const storeName = h.changeCase.camel(name) -%>
  <%= storeName %>Store,