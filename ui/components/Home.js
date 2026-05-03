import { useAuth } from "./contexts/UserContext.js";
import { useState } from "react";

const Section = ({ title, description, isVisible, setVisible }) => {
  return (
    <div className="p-2 m-2 border-2">
      <p className="font-bold text-lg font-mono">{title}</p>
      <button onClick={setVisible} className="cursor-pointer">
        {isVisible ? "hide" : "show"}
      </button>
      <div
        className={`overflow-hidden transition-all duration-700 ease-in-out ${isVisible ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
      >
        {isVisible && <p>{description}</p>}
      </div>
    </div>
  );
};
const Home = () => {
  const { userName } = useAuth();
  const [container, setContainer] = useState("");
  return (
    <div>
      <p>Welcome {userName}</p>
      <Section
        title="About Home"
        description={`Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`}
        isVisible={container === "about"}
        setVisible={() => setContainer(container === "about" ? "" : "about")}
      />

      <Section
        title="Details"
        description={`Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`}
        isVisible={container === "details"}
        setVisible={() =>
          setContainer(container === "details" ? "" : "details")
        }
      />

      <Section
        title="Carrers"
        description={`Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.`}
        isVisible={container === "carrers"}
        setVisible={() =>
          setContainer(container === "carrers" ? "" : "carrers")
        }
      />
    </div>
  );
};

export default Home;
