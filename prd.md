# Product Requirements Document: Virtual Math Whiteboard

## 1. Product Overview

The Virtual Math Whiteboard is an application that allows users to write mathematical expressions in the air and have them appear on a digital whiteboard. The user should be able to draw numbers, operation symbols, variables, parentheses, exponents, fractions, and other common math notation using hand gestures or a tracked writing object. The system will recognize the user’s air-drawn input, convert it into clean whiteboard strokes or formatted math text, and display it in real time.

The goal of this project is to create an interactive, futuristic whiteboard experience that makes math explanation more natural, especially for teaching, tutoring, presentations, and remote learning.

---

## 2. Problem Statement

Traditional whiteboards require a physical board, marker, stylus, or touchscreen. This limits flexibility, especially when teaching or presenting without access to a board. Current digital whiteboards usually require a mouse, drawing tablet, touchscreen, or stylus, which can feel unnatural or inconvenient.

This product solves that problem by allowing users to “write in the air” and have their math appear on a digital whiteboard automatically.

---

## 3. Target Users

### Primary Users

* Students explaining math problems
* Teachers and tutors giving lessons
* Remote learners
* Presenters demonstrating equations
* Developers or researchers experimenting with gesture-based interfaces

### Secondary Users

* People using AR/VR environments
* People with limited access to physical writing surfaces
* Content creators making educational math videos

---

## 4. Goals and Objectives

### Main Goal

Create an application that translates air-written math into a readable digital whiteboard format.

### Objectives

* Detect the user’s hand or writing object in real time.
* Track the motion path of the user’s writing gesture.
* Convert the motion path into whiteboard strokes.
* Recognize common math symbols and expressions.
* Display the final output clearly on a digital whiteboard.
* Allow users to erase, undo, clear, and edit their work.
* Provide a smooth, visually polished interface.

---

## 5. Core Features

## 5.1 Air Writing Detection

The application should use a camera to detect when the user is writing in the air.

### Requirements

* The system should track the user’s index finger, stylus, or colored marker.
* The system should distinguish between “writing mode” and “not writing mode.”
* The user should be able to start and stop drawing without accidentally creating unwanted marks.
* The system should work with a standard webcam.

### Possible Input Methods

* Index finger tracking
* Hand gesture detection
* Colored object tracking
* Stylus-like pointer tracking

---

## 5.2 Digital Whiteboard Canvas

The application should include a whiteboard area where the translated writing appears.

### Requirements

* The canvas should display strokes in real time.
* The user should be able to clear the board.
* The user should be able to undo the last stroke or symbol.
* The user should be able to erase specific parts of the board.
* The whiteboard should be visually clean and easy to read.

### Optional Features

* Different pen colors
* Adjustable pen thickness
* Grid or graph-paper background
* Dark mode
* Save board as an image or PDF

---

## 5.3 Math Symbol Recognition

The application should recognize air-drawn math symbols and convert them into cleaner whiteboard text.

### Required Symbols

* Numbers: 0–9
* Variables: x, y, z, a, b, c
* Operations: +, −, ×, ÷
* Equal sign: =
* Parentheses: ( )
* Decimal points
* Fractions
* Exponents

### Optional Advanced Symbols

* Square roots
* Greek letters
* Trigonometric functions: sin, cos, tan
* Calculus notation: derivatives and integrals
* Inequality symbols: <, >, ≤, ≥
* Summation notation

---

## 5.4 Expression Formatting

The system should not only recognize individual symbols, but also arrange them correctly as mathematical expressions.

### Requirements

* Recognize horizontal symbol order.
* Detect when a symbol is written above another symbol as an exponent.
* Detect fraction structures when one expression is written above another with a line between them.
* Preserve spacing between terms.
* Keep math readable and organized.

### Example

If the user writes in the air:

`x^2 + 3x = 10`

The whiteboard should display a clean version of:

`x² + 3x = 10`

---

## 5.5 Gesture Controls

The application should support simple gestures for controlling the whiteboard.

### Required Gestures

* Start drawing
* Stop drawing
* Undo
* Clear board
* Erase mode

### Possible Gesture Ideas

* Pinch fingers together to draw.
* Open palm to stop drawing.
* Swipe left to undo.
* Closed fist to erase.
* Two-hand gesture to clear the board.

The final gesture set should be simple enough that users do not accidentally trigger actions while writing.

---

## 5.6 Visual Feedback

The application should clearly show what it is detecting.

### Requirements

* Show a cursor or pointer where the system thinks the user is writing.
* Show whether the app is currently in drawing mode.
* Show recognized symbols after the user finishes a stroke.
* Display confidence feedback if recognition is uncertain.
* Provide a warning if the hand/object is not detected.

---

## 5.7 Correction and Editing

The user should be able to fix mistakes easily.

### Requirements

* Undo last stroke.
* Undo last recognized symbol.
* Erase part of the board.
* Redraw a symbol if recognition is incorrect.
* Optionally choose from multiple recognition suggestions.

### Example

If the app recognizes a user’s handwritten “x” as “×,” the user should be able to correct it.

---

## 6. User Stories

### Student User Story

As a student, I want to write equations in the air so that I can explain math problems without needing a physical whiteboard.

### Teacher User Story

As a teacher, I want to draw math expressions in the air and have them appear clearly on a screen so that students can follow my explanation.

### Tutor User Story

As a tutor, I want to quickly erase, undo, and rewrite math steps so that I can teach problems smoothly during a lesson.

### Presenter User Story

As a presenter, I want the app to clean up my air-written math so that my audience can read the equations clearly.

---

## 7. Functional Requirements

### Camera Input

* The application must access the user’s webcam.
* The application must process camera frames in real time.
* The application must detect the user’s writing point.

### Tracking

* The application must track the writing point across frames.
* The application must convert the tracked movement into a digital stroke.
* The application must reduce shaky or noisy motion.

### Drawing

* The application must draw strokes onto a digital canvas.
* The application must support clearing the canvas.
* The application must support undoing recent actions.

### Recognition

* The application must identify common math symbols.
* The application must convert rough air drawings into readable symbols.
* The application must handle simple expressions.

### User Interface

* The application must show the camera feed or a simplified tracking preview.
* The application must show the whiteboard canvas.
* The application must show the current mode: draw, erase, idle, or recognition.
* The application must provide buttons or keyboard shortcuts for key actions.

---

## 8. Non-Functional Requirements

### Performance

* The app should run at a smooth frame rate.
* Drawing should feel responsive with minimal delay.
* Symbol recognition should happen quickly after a stroke is completed.

### Accuracy

* The system should correctly recognize common numbers and symbols most of the time.
* The system should reduce false strokes caused by accidental hand movement.
* The system should include correction tools for misread symbols.

### Usability

* The app should be simple enough for a new user to understand within a few minutes.
* The drawing controls should not require complicated gestures.
* The interface should be clean and not distracting.

### Reliability

* The app should handle temporary tracking loss without crashing.
* The app should continue working if the user’s hand briefly leaves the camera frame.
* The app should provide clear feedback when tracking fails.

### Accessibility

* The app should support keyboard shortcuts.
* The app should include high-contrast visual options.
* The app should allow adjustable stroke size.

---

## 9. Suggested Technical Approach

### Frontend / Interface

Possible tools:

* Python with Pygame
* Python with Tkinter
* Python with PyQt
* Web app using JavaScript, HTML Canvas, and WebRTC

### Computer Vision

Possible tools:

* OpenCV for camera input and image processing
* MediaPipe Hands for hand tracking
* Color tracking if using a colored marker or object

### Recognition

Possible approaches:

* Template matching for simple symbols
* Machine learning classifier for handwritten symbols
* Neural network trained on math symbol datasets
* Stroke-based recognition using path shape features

### Math Formatting

Possible tools:

* Custom expression parser
* LaTeX-style output generation
* MathJax if built as a web app
* SymPy for expression parsing and simplification

---

## 10. Minimum Viable Product

The first version should focus on core functionality rather than advanced math recognition.

### MVP Features

* Webcam-based hand or object tracking
* Draw strokes on a digital whiteboard
* Start/stop drawing gesture
* Clear board button
* Undo button
* Basic recognition for numbers 0–9 and simple operations: +, −, =, ×
* Clean user interface with camera preview and whiteboard canvas

### MVP Success Criteria

* A user can write a simple equation in the air.
* The app displays the user’s writing on the whiteboard.
* The app can recognize at least basic numbers and operators.
* The user can undo and clear the board.
* The app runs smoothly on a normal laptop webcam.

---

## 11. Future Features

### Advanced Math Recognition

* Fractions
* Exponents
* Square roots
* Integrals
* Derivatives
* Matrices
* Graphing equations

### AI Assistance

* Convert handwriting into LaTeX.
* Solve written equations.
* Show step-by-step solutions.
* Detect mistakes in algebra.
* Simplify expressions automatically.

### Collaboration

* Multiplayer whiteboard sessions.
* Remote classroom mode.
* Shared board links.
* Export to Google Classroom or PDF.

### AR/VR Support

* Use AR glasses or VR controllers.
* Place the whiteboard in 3D space.
* Allow users to walk around the board.

---

## 12. User Interface Requirements

The interface should include:

* Main whiteboard canvas
* Camera preview window
* Current mode indicator
* Drawing/idle indicator
* Undo button
* Clear button
* Eraser button
* Recognition toggle
* Save/export button

### Suggested Layout

The whiteboard should take up most of the screen. The camera preview should appear in a smaller corner panel. Controls should be placed along the side or bottom so they do not block the writing area.

---

## 13. Risks and Challenges

### Tracking Accuracy

The system may struggle if lighting is poor, the background is cluttered, or the hand moves too quickly.

### Gesture Confusion

The app may accidentally trigger commands if gestures are too similar to normal writing motions.

### Symbol Recognition

Math symbols can be difficult to recognize because many symbols look similar, such as:

* x and ×
* 1 and l
* 0 and O
* − and fraction bars
* 2 and z

### Depth Problem

Writing in the air is three-dimensional, but the camera captures a two-dimensional image. The app will need to map hand movement onto the whiteboard accurately.

### User Fatigue

Writing in the air for too long can become tiring. The app should support short gestures, easy corrections, and optional mouse/stylus input.

---

## 14. Success Metrics

The project will be considered successful if:

* The app can track the user’s writing motion in real time.
* The app can display smooth digital strokes on the whiteboard.
* The user can write basic equations in the air.
* The recognition system correctly identifies common symbols with reasonable accuracy.
* The user can easily correct mistakes.
* The interface feels polished and understandable.

Possible measurable goals:

* At least 80% recognition accuracy for basic numbers and operators.
* Less than 150 ms visible drawing delay.
* App runs at 20+ frames per second.
* User can write and clear a simple equation within 30 seconds.
* New users can understand the basic controls in under 2 minutes.

---

## 15. Out of Scope for Version 1

The first version will not focus on:

* Full calculus recognition
* Complete equation solving
* Multiplayer collaboration
* AR/VR hardware support
* Perfect handwriting recognition
* Full LaTeX conversion
* Mobile app support

These may be added after the core whiteboard and recognition system are working.

---

## 16. Development Milestones

### Milestone 1: Basic Whiteboard

* Create a blank digital canvas.
* Add drawing functionality.
* Add clear and undo buttons.

### Milestone 2: Camera Tracking

* Connect webcam input.
* Detect hand or tracking object.
* Display pointer location on the screen.

### Milestone 3: Air Drawing

* Convert tracked movement into strokes.
* Add start/stop drawing logic.
* Smooth noisy movement.

### Milestone 4: Gesture Controls

* Add draw, idle, erase, undo, and clear gestures.
* Add visual feedback for each mode.

### Milestone 5: Basic Math Recognition

* Segment strokes into symbols.
* Recognize numbers and simple operators.
* Replace rough strokes with clean symbols.

### Milestone 6: Expression Formatting

* Detect symbol order.
* Support exponents and fractions.
* Improve spacing and alignment.

### Milestone 7: Polish and Testing

* Improve UI.
* Add settings.
* Test in different lighting conditions.
* Fix recognition errors.
* Add export/save option.

---

## 17. Open Questions

1. Should the user write with their finger, a colored object, or a stylus?
2. Should the app show raw handwriting, cleaned-up math symbols, or both?
3. Should the app be built as a Python desktop app or a web app?
4. Should the app solve equations or only display them?
5. Should the camera preview be visible at all times?
6. Should recognition happen after every stroke or only when the user presses a button?
7. What level of math should the app support first: arithmetic, algebra, geometry, or calculus?
8. Should the app support saving/exporting boards?
9. Should the app support voice commands later?
10. Should the app prioritize recognition accuracy or real-time drawing smoothness?

---

## 18. Recommended Version 1 Scope

For the first version, the project should focus on building a strong core system:

* Webcam hand tracking
* Air drawing onto a whiteboard
* Pinch gesture to draw
* Open hand to stop drawing
* Clear and undo controls
* Basic number/operator recognition
* Clean whiteboard UI

The first version should not try to solve every math recognition problem. The most important goal is proving that air movement can reliably become readable whiteboard writing.
