<<<<<<< HEAD
import { useEffect, useState } from "react";
import api from "../../../utils/api";
import iconImage from "./book.png";

export const Programs = () => {
  const userID = localStorage.getItem("userID");
  const [recommendedPrograms, setRecommendedPrograms] = useState([]);
  const [programs, setPrograms] = useState([]);
=======
import { useEffect, useState } from "react"
import useUserData from "../../../hooks/useUserData"
import { useCookies } from "react-cookie"
import api from "../../../utils/api"

export const Programs = () => {
  const userID = localStorage.getItem("userID")
  const [ recommendedPrograms, setRecommendedPrograms ] = useState([])
  const [ programs, setPrograms ] = useState([])
  const { user } = useUserData()
  const [cookies] = useCookies(["access_token"])
  const access_token = cookies.access_token
>>>>>>> 11df758610e2f5265c1c380b792286b7df2cafb3
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
<<<<<<< HEAD
        const response = await api.get(`/e-library/${userID}/programs`);

console.log(response.data)
        setPrograms(response.data.restOfPrograms);

        setRecommendedPrograms(response.data.recommendedPrograms);
=======

        const config = {
          headers: {
            Authorization: `Bearer ${access_token}`, 
          },
        }
        if (user.role === 'Student') {
          const response = await api.get(`/users/${userID}/programs`, config)

          setPrograms(response.data.restOfPrograms)
          setRecommendedPrograms(response.data.recommendedPrograms)
        } else {
          const response = await api.get(`/programs/get-programs`, config)
          setPrograms(response.data.programs)
        }
>>>>>>> 11df758610e2f5265c1c380b792286b7df2cafb3
      } catch (err) {
        console.log(err);
      }
<<<<<<< HEAD
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
=======
    }
    fetchPrograms()
    console.log('NAGRERENDER')
  }, [user])

  return (
    <div className="programs">
      { recommendedPrograms.length > 0 &&
        <>
          <h2>Recommended</h2>
          <div className="recommended-programs">
          { recommendedPrograms.map((program) => (
            <div className="program-card">
              <div className="book-img-div">
                <img className='book-img' src='book.png' alt="books" /> 
              </div>
              <div className="program-details">
                <p className="program-title"><strong>{program.title}</strong></p>
                <p>{program.description}</p>
              </div>
            </div>
          ))}
          </div> 
        </>
      }
      { recommendedPrograms.length > 0 && <h2>Others</h2> }
      <div className="other-programs">
      { programs.map((program) => (
        <div className="program-card">
          <div className="book-img-div">
            <img className='book-img' src='book.png' alt="books" /> 
          </div>
          <div className="program-details">
            <h1 className="program-title">{program.title}</h1>
            <p>{program.description}</p>
          </div>
        </div>
      ))}
>>>>>>> 11df758610e2f5265c1c380b792286b7df2cafb3
      </div>
    </div>
  );
};