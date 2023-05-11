<template>
    <div class="progress-bar-container">
        <div :style="progressBarStyle" class="progress-bar"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch, ref } from 'vue';

const progressValue = ref(0);
const progressTimer = ref(null);
const progressBarStyle = reactive({
    width: "0%"
});
const props = defineProps({
    isFinished: Boolean
});

const changeProgressBarStyle = (value: number) => {
    progressBarStyle.width = value + "%";
}

const changeProgressValue = () => {
    if (progressValue.value > 90) {
        progressValue.value = 90;
    }
    clearTimeout(progressTimer.value);
    progressTimer.value = setTimeout(function () {
        if (progressValue.value < 100) {
            progressValue.value += 2;
            changeProgressBarStyle(progressValue.value);
            changeProgressValue();
        }
    }, 500);
}

onMounted(
    () => {
        changeProgressValue();
    }
);

watch(()=> props.isFinished,(newValue)=>{
        if(newValue){
            changeProgressBarStyle(100);
            clearTimeout(progressTimer.value);
        }
    }
);

</script>

<style scoped>
.progress-bar-container{
    width: 402px;
    height: 12px;
    background: #EEEEEE;
    border-radius: 2px;
}
.progress-bar{
    height: 100%;
    background: #FAB400;
}
</style>