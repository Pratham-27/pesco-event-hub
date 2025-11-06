import collegeHeader from "@/assets/college-header.png";

const CollegeHeader = () => {
  return (
    <div className="w-full bg-background border-b-2 border-primary/20">
      <div className="container mx-auto px-4 py-3">
        <img 
          src={collegeHeader} 
          alt="Phaltan Education Society's College of Engineering, Phaltan" 
          className="w-full h-auto max-w-5xl mx-auto"
        />
      </div>
    </div>
  );
};

export default CollegeHeader;
