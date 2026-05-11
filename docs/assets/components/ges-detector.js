
// インタラクトを検知する a-sceneに付ける。
AFRAME.registerComponent("ges-detector", {
    schema: {
        element: {default: ""}
    },

    // 初期化処理
    init: function(){
        this.targetElement =
            this.data.element && document.querySelector(this.data.element)
        
        if(!this.targetElement){
            this.targetElement = this.el
        }

        this.internalState = {
            previousState: null
        }
        // イベントリスナ設定
        this.emitGestureEvent = this.emitGestureEvent.bind(this)
        this.targetElement.addEventListener("touchstart", this.emitGestureEvent)
        this.targetElement.addEventListener("touchend", this.emitGestureEvent)
        this.targetElement.addEventListener("touchmove", this.emitGestureEvent)
    },

    remove: function(){
        // イベントリスナ削除
        this.targetElement.removeEventListener("touchstart", this.emitGestureEvent)
        this.targetElement.removeEventListener("touchend", this.emitGestureEvent)
        this.targetElement.removeEventListener("touchmove", this.emitGestureEvent)
    },

    // イベントリスナ用関数
    emitGestureEvent(event){
        const currentState = this.getTouchState(event)
        const previousState = this.internalState.previousState
        
        const gestureContinues = previousState && currentState && currentState.touchCount == previousState.touchCount

        const gestureEnded = previousState && !gestureContinues
        const gestureStarted = currentState && !gestureContinues
        
        if(gestureEnded){
            // ジェスチャー終了時，イベントを投げる
            const eventName = this.getEventPrefix(previousState.touchCount) + "fingerend"
            this.el.emit(eventName, previousState)
            this.internalState.previousState = null
        }

        if(gestureStarted){
            // ジェスチャー開始時
            currentState.startTime = performance.now()
            currentState.staartPosition = currentState.position
            currentState.startSpread = currentState.spread

            const eventName = this.getEventPrefix(currentState.touchCount) + "fingerstart"
            this.el.emit(eventName, currentState)
            this.internalState.previousState = currentState
        }

        if(gestureContinues){
            const eventDetail = {
                positionChange: {
                    x: currentState.position.x - previousState.position.x,
                    y: currentState.position.y - previousState.position.y
                }
            }

            if(currentState.spread){
                eventDetail.spreadChange = currentState.spread - previousState.spread
            }

            // state更新
            Object.assign(previousState, currentState)
            
            Object.assign(eventDetail, previousState)

            const eventName = this.getEventPrefix(currentState.touchCount) + "fingermove"
            this.el.emit(eventName, eventDetail)
        }
    },

    getTouchState: function(){
        // どこも触ってなければNULL
        if(event.touches.length === 0){
            return null
        }

        const touchList = []

        for (let i = 0; i < event.touches.length; i++){
            touchList.push(event.touches[i])
        }

        const touchState = {
            touchCount: touchList.length
        }

        // どこ触ってるか確認する
        const centerPositionRawX = touchList.reduce((sum, touch) => sum + touch.clientX, 0) / touchList.length
        const centerPositionRawY = touchList.reduce((sum, touch) => sum + touch.clientY, 0) / touchList.length

        touchState.positionRaw = { x: centerPositionRawX, y: centerPositionRawY}

        const screenScale = 2 / (window.innerWidth + window.innerHeight)

        touchState.position = { x: centerPositionRawX * screenScale, y:centerPositionRawY * screenScale}

        if(touchList.length >= 2){
            const spread = touchList.reduce((sum, touch) => {
                return ( sum + Math.sqrt(Math.pow(centerPositionRawX - touch.clientX, 2) + Math.pow(centerPositionRawY - touch.clientY, 2)))
            }, 0) / touchList.length

            touchState.spread = spread * screenScale
        }

        return touchState
    },

    getEventPrefix(touchCount){
        const numberNames = ["one", "two", "three", "many"]
        return numberNames[Math.min(touchCount, 4) - 1]
    }
})