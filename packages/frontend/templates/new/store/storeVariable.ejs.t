---
inject: true
to: utils/store-accessor.ts
before: variable insertion point
---
<% const storeName = h.changeCase.camel(name) -%>
let <%= storeName %>Store: <%= storeName %>