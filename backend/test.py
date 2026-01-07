from googletrans import Translator

translator = Translator()

text = "Hello, how are you?"
translated = translator.translate(text, dest="ta")  # Tamil

print(translated.text)
