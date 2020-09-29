---
inject: true
to: plugins/store-accessor.ts
before: import insertion point
---
<% const storeName = h.changeCase.camel(name) -%>
import <%= storeName %> from '@/store/<%= storeName %>'