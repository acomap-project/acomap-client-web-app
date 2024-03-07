<script setup lang="ts">
import AppMap from '@/components/AppMap.vue'
</script>

<script lang="ts">
import { AccomService } from '@/services/accom.service'

const service = new AccomService()

export default {
  data(): any {
    return {
      DISTRICT_LIST: ['binh-thanh', 'phu-nhuan', 'go-vap', 'thu-duc'],
      accomGroupList: [],
      selectedAccomGroupIndex: -1,
      selectedDistrict: null,
      isSearching: false,
      searchInfo: {
        district: '',
        mostRecentDays: 0,
        minPrice: 0,
        maxPrice: 0,
        location: null,
        maxDistance: null
      }
    }
  },
  mounted() {
    service.listAccommodations({}).then((accomGroupList) => {
      this.accomGroupList = accomGroupList
    })
  },
  computed: {
    selectedAccomGroup() {
      return this.accomGroupList[this.selectedAccomGroupIndex]
    },
    accomGroupListCount() {
      return this.accomGroupList.reduce((totalCount: number, accomGroup: any) => {
        return totalCount + accomGroup.items.length
      }, 0)
    },
    accomMarkerList() {
      if (!this.accomGroupList.length) {
        return []
      }
      return this.accomGroupList.map((group: any) => {
        return {
          lat: group.location.latitude,
          lng: group.location.longitude
        }
      })
    }
  },
  methods: {
    $onMarkerClicked({ index }: { marker: any; index: number }) {
      this.toggleSelectedAccom(index)
    },
    toggleSelectedAccom(accomGroupIndex: number) {
      if (this.selectedAccomGroupIndex && this.selectedAccomGroupIndex === accomGroupIndex) {
        this.selectedAccomGroupIndex = -1
        return
      }
      this.selectedAccomGroupIndex = accomGroupIndex
    },
    searchAccommodations() {
      this.isSearching = true
      service
        .listAccommodations(this.searchInfo)
        .then((accomGroupList) => {
          this.accomGroupList = accomGroupList
          this.isSearching = false
        })
        .catch((error) => {
          // create a component to notify error
          this.isSearching = false
          // use a vuetify component to notify error
          this.$toast.error(error.message)
        })
    }
  }
}
</script>

<template>
  <v-layout class="rounded rounded-md" style="height: 100vh">
    <v-app-bar title="Application bar"></v-app-bar>

    <v-navigation-drawer :width="350">
      <v-list-item style="padding: 16px">
        <h2>Tìm kiếm</h2>
        <v-form style="margin-top: 16px" ref="form">
          <v-combobox
            label="Quận"
            v-model="searchInfo.district"
            :items="['Bình Thạnh', 'Phú Nhuận', 'Gò Vấp', 'Thủ Đức']"
          ></v-combobox>

          <v-text-field
            label="Ngày gần nhất"
            v-model.number="searchInfo.mostRecentDays"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Gía phòng thấp nhất (triệu)"
            v-model.number="searchInfo.minPrice"
            type="number"
          ></v-text-field>

          <v-text-field
            label="Gía phòng cao nhất (triệu)"
            v-model.number="searchInfo.maxPrice"
            type="number"
          ></v-text-field>

          <v-text-field label="Vị trí của bạn" v-model="searchInfo.location"></v-text-field>
          <v-text-field
            label="Khoảng cách xa nhất (km)"
            v-model.number="searchInfo.maxDistance"
            type="number"
          ></v-text-field>

          <div class="d-flex flex-column">
            <v-btn color="primary" class="mt-4" :loading="isSearching" @click="searchAccommodations"
              >Tìm kiếm</v-btn
            >
          </div>
        </v-form>
        <v-divider style="margin: 32px 0"></v-divider>
        <div>
          <h2 style="margin-top: 16px">Kết quả tìm kiếm</h2>
          <p>Tìm thấy {{ accomGroupListCount }} phòng trọ</p>
        </div>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-if="!!selectedAccomGroup" location="right" :width="350">
      <div style="padding: 16px">
        <h2>Thông tin phòng trọ</h2>
      </div>
      <v-sheet
        class="accom-detail-info ma-4 pa-5"
        :elevation="2"
        v-for="accom in selectedAccomGroup.items"
        :key="accom.id"
      >
        <div class="accom-detail-info-property">
          <p>Địa chỉ</p>
          <p>
            <a :href="accom.propUrl" target="_blank">
              {{ accom.address }}
            </a>
          </p>
        </div>
        <div class="accom-detail-info-property">
          <p>Giá phòng</p>
          <p>{{ accom.price }} triệu</p>
        </div>
        <div class="accom-detail-info-property">
          <p>Thời gian đăng</p>
          <p>{{ accom.publishedDate }}</p>
        </div>
      </v-sheet>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center" style="min-height: 300px; width: 100%">
      <AppMap :markerList="accomMarkerList" @marker-clicked="$onMarkerClicked" />
    </v-main>
  </v-layout>
</template>

<style scoped>
.vue-map-container {
  height: 100%;
  width: 100%;
}

.accom-detail-info {
  > .accom-detail-info-property {
    > p:first-child {
      font-weight: bold;
    }
  }

  > .accom-detail-info-property:not(:last-child) {
    margin-bottom: 12px;
  }
}
</style>
