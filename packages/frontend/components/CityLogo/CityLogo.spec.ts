import { shallowMount } from '@vue/test-utils'
import CityLogo from '@/components/CityLogo/CityLogo.vue'

describe('CityLogo component', () => {
  it('exports a valid component', () => {
    const wrapper = shallowMount(CityLogo, {
      computed: {
        cityLogo() {
          return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQzIiBoZWlnaHQ9IjQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTQuOTEgNDcuNjM5bDIuOTY5LTIuOTY3VjMyLjc2NWwxNC44MzggMTQuODczaDExLjkxbDIuOTY4LTIuOTY2VjIwLjg5OEw2Mi40MzMgMzUuNzd2OC45bDIuOTY4IDIuOTY4aDExLjg3MWwyLjk2OC0yLjk2N1YzNS43N2wxNC44MzgtMTQuODc0VjMuMDk2TDkyLjExMS4xMjlIODAuMjRsLTIuOTY4IDIuOTY3VjkuMDNsLTUuOTM1IDUuOTMzTDY1LjQgOS4wM1YzLjA5Nkw2Mi40MzMuMTI5aC0xMS44N2wtMi45NjggMi45NjdMNDQuNjI3LjEyOWgtMTEuOTFMMjkuNzUgMy4wOTZ2MTEuODY3TDE0LjkxLjEzSDMuMDRMLjA3MiAzLjA5NnY0MS41NzZsMi45NjggMi45NjdoMTEuODd6bTEyNC43MjQtMjYuNzhsMi45NjctMi45Mjl2LTguOUwxMzMuNjk4LjEyOWgtMjkuNzE2bC04LjkwMyA4Ljl2MjkuNzA4bDguOTAzIDguOTAxaDI5LjcxNmw4LjkwMy04Ljl2LTguOTRsLTIuOTY3LTIuOTY3aC0xNC44Mzl2Mi45NjdoLTExLjg3MVYxNy45M2gxMS44NzF2Mi45MjhoMTQuODM5eiIgZmlsbD0iIzIxNTdFNCIvPjwvc3ZnPg=='
        },
      },
    })

    expect(wrapper.html()).toBeTruthy()
  })
})
