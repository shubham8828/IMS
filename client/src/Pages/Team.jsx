import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaBriefcase,
  FaUserTie,
} from "react-icons/fa";
import { SiProbot } from "react-icons/si";
import './Team.css'


const Team = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      // When a popstate event occurs, redirect to /home
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);



  
  const teamHead = {
    title: "Project Mentor",
    name: "Prof. Vandana Maurya",
    email: "vm@gmail.com",
    profession: "Assistant Professor",
    experience: "5+ years",
  };

  const teamMembers = [
    {
      title: "Developer",
      name: "Shubham Vishwakarma",
      email: "skv6621@gmail.com",
      profession: "Full Stack Developer",
      github: "https://github.com/shubham8828",
      linkedin: "https://www.linkedin.com/in/shubham-vishwakarma-8b2b06260/",
    },
    {
      title: "Developer",
      name: "Vikas Vishwakarma",
      email: "vikasrv.9922@gmail.com",
      profession: "Software Developer",
      github: "https://github.com/Vikas-922",
      linkedin: "https://www.linkedin.com/in/vikas-vishwakarma-11b686319/",
    },
  ];

  return (
    <div className="main-container">
      <div className="team-container" >
        {/* Project Title */}
        <div className="projectCard" >
          <h1 className="projectTitle" style={{textAlign:'center'}}>
            <SiProbot className="icon" /> AIMPS Project
          </h1>
        </div>

        {/* Team Head */}
        <div className="teamSection">
          <div className="card">
            <div className="imagePlaceholder">
              <FaUserTie className="placeholderIcon" />
            </div>
            <h3 className="name">{teamHead.name}</h3>
            <p className="title">{teamHead.title}</p>
            <p className="profession">
              <FaBriefcase className="team-icon" /> {teamHead.profession}
            </p>
            <p className="experience">
              <FaBriefcase className="team-icon" /> {teamHead.experience}
            </p>
            <p className="email">
              <FaEnvelope className="team-icon" />{" "}
              <a href={`mailto:${teamHead.email}`} className="team-link">
                {teamHead.email}
              </a>
            </p>
          </div>
        </div>

        {/* Team Members */}
        <div className="teamSection">
          {teamMembers.map((member, index) => (
            <div key={index} className="card">
              <div className="imagePlaceholder">
                <FaUserTie className="placeholderIcon" />
              </div>
              <h3 className="name">{member.name}</h3>
              <p className="title">{member.title}</p>
              <p className="profession">
                <FaBriefcase className="team-icon" /> {member.profession}
              </p>
              <p className="email">
                <FaEnvelope className="team-icon" />{" "}
                <a href={`mailto:${member.email}`} className="team-link">
                  {member.email}
                </a>
              </p>
              <div className="teamsocialIcons">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="team-icon" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="team-icon" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
