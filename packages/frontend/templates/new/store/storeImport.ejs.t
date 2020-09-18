---
inject: true
to: utils/store-accessor.ts
before: import insertion point
---
<% const storeName = h.changeCase.camel(name) -%>
import <%= storeName %> from '@/store/<%= storeName %>'