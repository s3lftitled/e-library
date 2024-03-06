import { useEffect, useState } from "react";
import api from "../../../utils/api";
import iconImage from "./book.png";

export const Programs = () => {
  const userID = localStorage.getItem("userID");
  const [recommendedPrograms, setRecommendedPrograms] = useState([]);
  const [programs, setPrograms] = useState([]);
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get(`/e-library/${userID}/programs`);

console.log(response.data)
        setPrograms(response.data.restOfPrograms);

        setRecommendedPrograms(response.data.recommendedPrograms);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPrograms();
    console.log('NAGRERENDER');
  }, []);

  return (
    <div className="programs">
      <h2><u>Recommended</u></h2>
      <div className="recommended-programs">
        {recommendedPrograms.map((program, index) => (
          <div className="program-card" key={index}>
            <img src={iconImage} alt="book" className="program-icon book" />
            <p><u>{program.title}</u></p>
            <p>{program.description}</p>
          </div>
        ))}
      </div>
      <h2><u>Others</u></h2>
      <div className="other-programs">
        {programs.map((program, index) => (
          <div className="program-card" key={index}>
            <img src={iconImage} alt="Icon" className="program-icon book" />
            <div><p><u>{program.title}</u></p>
            <p>{program.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};