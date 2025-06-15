import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import studyGuides from "../data/studyGuides";

async function setupStudyGuides() {
  for (const guide of studyGuides) {
    const guideRef = doc(db, "studyGuides", guide.courseCode);
    await setDoc(guideRef, {
      courseCode: guide.courseCode,
      title: guide.title,
      description: guide.description,
      imageUrl: guide.imageUrl,
    });
  }
  console.log("Study guides set up!");
}

setupStudyGuides(); 