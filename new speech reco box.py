class MyClass(GeneratedClass):
    def __init__(self):
        GeneratedClass.__init__(self)

        self.asr = None
        self.tts = None
        self.memory = None

        self.word_subscriber = None
        self.word_signal = None

        self.subscriber_name = "SafeSpeechRecoBox"
        self.subscribed = False
        self.vocab_initialized = False
        self.listening = False

        self.confidence_threshold = 0.4
        self.vocab = ["yes", "no", "back"]

    def onLoad(self):
        try:
            self.asr = ALProxy("ALSpeechRecognition")
            self.tts = ALProxy("ALTextToSpeech")
            self.memory = ALProxy("ALMemory")
        except Exception as e:
            self.emitError("onLoad error: " + str(e))

    def onUnload(self):
        self.stopReco()

    def emitError(self, msg):
        try:
            self.onError(str(msg))
        except:
            self.logger.error(str(msg))

    def stopTTS(self):
        try:
            if self.tts is not None:
                self.tts.stop()
        except Exception as e:
            self.logger.warning("stopTTS failed: " + str(e))

    def onInput_onStart(self):
        try:
            self.logger.info("Step 1: stopTTS")
            self.stopTTS()

            self.logger.info("Step 2: initVocabularyOnce")
            self.initVocabularyOnce()

            self.logger.info("Step 3: startReco")
            self.startReco()

            self.logger.info("SafeSpeechReco started")

        except Exception as e:
            self.emitError("onStart error: " + str(e))

    def onInput_onStop(self):
        self.stopReco()
        try:
            self.onStopped()
        except:
            pass

    def initVocabularyOnce(self):
        if self.vocab_initialized:
            return

        try:
            self.asr.pause(True)
            self.asr.setLanguage("English")
            self.asr.setVocabulary(self.vocab, False)
            self.vocab_initialized = True
            self.asr.pause(False)

        except Exception as e:
            try:
                self.asr.pause(False)
            except:
                pass
            raise Exception("initVocabularyOnce error: " + str(e))

    def startReco(self):
        if self.listening:
            return

        try:
            self.word_subscriber = self.memory.subscriber("WordRecognized")
            self.word_signal = self.word_subscriber.signal.connect(self.onWordRecognized)

            if not self.subscribed:
                self.asr.subscribe(self.subscriber_name)
                self.subscribed = True

            self.listening = True

        except Exception as e:
            raise Exception("startReco error: " + str(e))

    def stopReco(self):
        self.listening = False

        try:
            if self.word_subscriber is not None and self.word_signal is not None:
                self.word_subscriber.signal.disconnect(self.word_signal)
        except:
            pass

        self.word_subscriber = None
        self.word_signal = None

        try:
            if self.asr is not None and self.subscribed:
                self.asr.unsubscribe(self.subscriber_name)
                self.subscribed = False
        except:
            self.subscribed = False

    def convertTupleToString(self, value):
        if value is None or len(value) < 2:
            return None

        try:
            return str(value[0]).lower().strip()
        except:
            return None

    def onWordRecognized(self, value):
        try:
            if not self.listening:
                return

            if value is None or len(value) < 2:
                return

            word = self.convertTupleToString(value)
            confidence = float(value[1])

            if word is None:
                return

            if word not in self.vocab:
                return

            if confidence < self.confidence_threshold:
                return

            self.stopReco()

            self.onRecoResult(word)
            self.onConfidence(confidence)

        except Exception as e:
            self.emitError("onWordRecognized error: " + str(e))