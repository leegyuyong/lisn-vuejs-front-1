<template>
  <div class="noteNavbar-container">
    <div @click="gotoLish()" class="ns-kr go-back" style="font-size: 20px;font-weight:bold;color:black;position: relative;z-index: 2;margin: 10px;">
      <i class="fas fa-chevron-left"></i>&nbsp;노트 리스트
    </div>

    <PlayerRead v-on:scrollSTT="$emit('scrollSTT')" v-on:openSTT="$emit('openSTT')" v-on:isRecording="isRecording"></PlayerRead>

    <div style="display:flex;">
        <base-nav style="display: flex;align-items: center;">
            <li class="nav-item dropdown">
              <a data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <div style="display: flex; align-items: center; position: relative; flex-direction: row-reverse; margin-right: 12px; transform: translateZ(0px);">
                  <div v-for="user in sharedUserList" :key="user.user_email" >
                    <div class="shared-people-cont1">
                      <div class="shared-people-cont2">
                        <div class="shared-people-cont3">
                          <div style="width: 100%; height: 100%;">
                            <img :src="user.user_picture_url" style="border-radius: 100%;width:30px">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
              <div class="dropdown-menu dropdown-menu-right dropdown-default" style="padding: 0">
                  <ul class="dropdown-menu show dropdown-menu-right" style="min-width: 180px;cursor: default;width: calc(100% + 20px);" @click.stop="">
                      <div class="dropdown-header noti-title dropdown-title ns-kr" style="color:black;cursor: default;text-transform: none;">
                        <div>
                          <div style="font-weight: normal;font-size: 16px;">
                            노트를 공유중...
                          </div>
                        </div>
                      </div>
                      <div class="dropdown-divider"></div>
                      <div v-for="user in sharedUserListAll" :key="user.user_email" class="dropdown-item" style="display: flex;align-items: center;">
                        <div class="navbar-icon">
                            <img :src="user.user_picture_url" style="border-radius: 100%;width:22px">
                        </div>
                        <div style="justify-content: space-between;display: flex;width: 100%;margin-left: 8px;">
                          <span class="ns-kr navbar-txt" style="font-size: 14px;">{{user.user_name}}</span>
                          <div v-if="noteUserId == user_id" class="remove-share-cont" @click.stop="removeSharedPerson(user.user_name, user.user_id)">
                            <template v-if="!user.is_master">
                              <i class="fas fa-ban"></i>
                            </template>
                          </div>
                        </div>
                      </div>
                  </ul>
              </div>
            </li>
        </base-nav>

        <button class="share-btn" style="position: relative;" @click="shareNote()">
          <div class="ns-kr" style="font-size: 16px; margin: 8px 14px;font-weight: bold;width: 52px;">공유</div>
        </button>
        <button class="edit-btn" style="position: relative;" @click="editNote()">
          <div class="ns-kr" style="font-size: 16px; margin: 8px 14px;font-weight: bold;width: 72px;">수정하기</div>
        </button>
      </div>
      <div v-if="openSearch" class="search-email-cont1" @click.self="openSearch=false">
        <div class="search-email-cont2 ">
          <div class="search-email-header ns-kr">노트 공유하기</div>
          <input v-on:input="typing" class="swal2-input" placeholder="공유할 사용자의 이메일을 적으세요" type="email" style="display: flex;">
          <div v-for="person in searchedPeople" :key="person.user_id">
            <div v-if="person.user_id != user_id" class="search-email-person" @click="selectPerson(person)">
              <img :src="person.user_picture_url" style="border-radius: 100%;width: 24px;cursor: pointer;">
              <div class="ns-kr" style="margin-left: 10px;font-size: 16px;cursor: pointer;">{{person.user_email}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import PlayerRead from '../components/PlayerRead'
import BaseNav from '../components/Navbar/BaseNav';
import Swal from 'sweetalert2';
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  components: {
    PlayerRead,
    BaseNav,
  },
  data(){
    return{
      openSearch: false,
    }
  },
  computed: {
    ...mapState([
      'note_id',
      'sharedUserList',
      'sharedUserListAll',
      'searchedPeople',
      'user_id',
      'noteUserId',
      'directory_id',
      'directory_name',
      'curDirectory'
    ]),
  },
   methods: {
     ...mapMutations([
       'clear_searched_people',
       'set_isNewNote',
     ]),
    ...mapActions([
      'SHARE_NOTE',
      'UPDATE_EDIT',
      'FETCH_EDIT',
      'FETCH_SHAREDUSER_LISTS',
      'FETCH_SEARCH_USER',
      'MASTER_UNSHARE_NOTE',
    ]),
    gotoLish(){
      if(this.curDirectory == 'allNotes'){
        this.$router.push('/allNotes')
      } else if(this.curDirectory == 'sharedNotes'){
        this.$router.push('/sharedNotes')
      } else if(this.curDirectory == 'directory'){
        this.$router.push(`/folder/${this.directory_id}/${this.directory_name}`)
      } else{
        this.$router.push('/allNotes')
      }
    },
    removeSharedPerson(user_name, remove_user_id){
      let self = this;
      Swal.fire({
        title: '공유 해제',
        text: '"' + user_name + '" 를 공유 해제합니다',
        // type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-danger btn-fill',
        cancelButtonClass: 'btn btn-secondary btn-fill',
        confirmButtonText: '해제',
        cancelButtonText: '취소',
        buttonsStyling: false
      }).then(result => {
        if (result.value) {
          const note_id = self.note_id;
          self.MASTER_UNSHARE_NOTE({note_id, remove_user_id});
        }
      });
      },
      selectPerson(person){
        if(person.user_id == this.user_id){
            Swal.fire("자신에게는 공유를 할 수 없습니다.");
            return;
        }
        let self = this;
        this.openSearch = false;
        Swal.fire({
          title: '노트 공유',
          text: person.user_email+' 님에게 노트를 공유하겠습니까?',
          // type: 'warning',
          showCancelButton: true,
          confirmButtonClass: 'btn btn-success btn-fill',
          cancelButtonClass: 'btn btn-danger btn-fill',
          confirmButtonText: '공유',
          cancelButtonText: '취소',
          buttonsStyling: false
        }).then(async(result) => {
          if (result.value) {
            await self.SHARE_NOTE(person.user_email);
            await self.FETCH_SHAREDUSER_LISTS(self.note_id);
            this.$amplitude.setUserId(this.user_id);
            this.$amplitude.logEvent('SHARE_NOTE');  
          }
        });
      },
      typing(e) {
        if(e.target.value == ""){
          this.clear_searched_people();
        }
        else{
          this.FETCH_SEARCH_USER(e.target.value);
        }
      },
      isRecording(para){
        this.$emit('isRecording', para);
      },
      editNote(){
        let self = this;
        this.FETCH_EDIT(this.note_id).then(data =>{
          if( data === "editable" ){
            self.UPDATE_EDIT(self.note_id);
            self.$router.push('/noteEdit/'+ self.note_id);
          }
        })
      },
      shareNote(){
        this.clear_searched_people();
        this.openSearch = true;
      },
   }
};
</script>
<style scoped>
.remove-share-cont{
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: darkgray;
  cursor: pointer;
  transition: all 200ms ease-in 0s;
  margin-left: 10px;
}
.remove-share-cont:hover{
  color: black;
}
.dropdown-item:hover {
    background-color: #fff;
}
.navbar{
  padding: 0px;
}
.search-email-person{
  padding: 3px;
  display:flex;
  width: fit-content;
  transition: all 200ms ease-in 0s;
  border-radius: 6px;
}
.search-email-person:hover{
  background: #ebebeb
}
.search-email-cont1{
  display: flex;
  position: fixed;
  z-index: 1060;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: .625em;
  overflow-x: hidden;
  background-color: rgba(0,0,0,.4);
  transition: background-color .1s;
}
.search-email-cont2{
  display: flex;
    position: relative;
    box-sizing: border-box;
    flex-direction: column;
    justify-content: center;
    width: 32em;
    max-width: 100%;
    padding: 1.25em;
    border: none;
    border-radius: .3125em;
    background: #fff;
    font-family: inherit;
    font-size: 1rem;
}
.search-email-header{
  font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 21px;
}

.shared-people-cont1{
  border-radius: 30px; 
  margin-left: -10px; 
  position: relative;
}
.shared-people-cont2{
  background: white;
  border-radius: 100%;
  box-shadow: rgba(15, 15, 15, 0.2) 0px 2px 4px;
}
.shared-people-cont3{
  position: relative;
  border-radius: 100%;
  background: white; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  user-select: none; 
  opacity: 0.8;
  transition: all 200ms ease-in 0s;
}
.shared-people-cont3:hover{
  opacity: 1;
}
.shared-people-img{
  display: block;
  object-fit: cover;
  border-radius: 100%;
  width: 100%;
  height: 100%;
}
@media (min-width: 992px) { 
  .noteNavbar-container{
    padding-right: 2rem !important;
    padding-left: 2rem !important;
  }
}

@media (min-width: 1200px) { 
  .noteNavbar-container{
    padding-right: 6rem !important;
    padding-left: 6rem !important;
  }
}
.noteNavbar-container{
  background: white !important;
  height: 80px;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem 0 0;
  align-items: center;
  border-bottom: 1px solid #e9ecef !important;
  box-shadow: rgba(0, 0, 0, 0.06) 0px 0px 8px -1px;
}
.edit-btn{
    background-color: #f1404b !important;
    border: 1px solid black;
    border-color: #f1404b !important;
    color: white !important;
    border-radius: 0.2rem;
    outline: 0;
    margin-left: 10px;
    transition: all 200ms ease-in 0s;
    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px;
}
.edit-btn:hover{
    background-color: #e1424c !important;
}
.share-btn{
    box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px;
    background-color: #e2e2e2;
    color: black !important;
    border-radius: 0.2rem;
    outline: 0;
    transition: all 200ms ease-in 0s;
    display: block !important;
}
.share-btn:hover{
    background-color: #d3d3d3 !important;
}
.share-pelple-btn{
    background-color: #F0F0F0 !important;
    border: 1px solid black;
    border-color: #F0F0F0 !important;
    color: black !important;
    border-radius: 0.2rem;
    outline: 0
}
a {
    text-decoration: none !important;
}
.nav-link{
    transition: all .4s ease 0s;
}
.nav-link:not(.btn):hover {
    background-color: hsla(0,0%,100%,.3);
    border-radius: .2rem;
    color: #fff;
    transition: all .4s ease 0s;
}
.nav-item{
    cursor: pointer;
}
.go-back{
    transition: all .4s ease 0s;
}
.go-back:hover{
    color: black !important;
    cursor: pointer;
}
</style>