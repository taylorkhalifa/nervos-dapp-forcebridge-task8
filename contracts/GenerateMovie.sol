pragma solidity >=0.8.0;

contract GenerateMovie {
  uint max;
  
  uint public totalMovie;
  
  mapping(uint => Movie) public movies;

  constructor()  {
    totalMovie = 0;
  }
  
  struct Movie{
    uint id;
    string name;
    uint rate;
    uint totalRate;
    uint rateSize;
  }
  
  function createMovie(string memory _name,uint _rate) public{
      require(_rate > 0 && _rate <=10, "Wrong rate!");
      totalMovie += 1;
      movies[totalMovie] = Movie(totalMovie,_name,_rate,_rate,1);
  }

  function getGeneratedMovie(string memory _fullName) public view returns(uint){
    require(totalMovie>0,"Add movie first");
    uint randNumber = _generateRandom(_fullName);
    return randNumber;
  }
  
  function rateMovie(uint _movieId,uint _rate) public{
    Movie storage _movie = movies[_movieId];
    _movie.rate = _movie.totalRate+_rate/_movie.rateSize+1;
    _movie.totalRate = _movie.totalRate + _rate;
    _movie.rateSize += 1;
  }

  function _generateRandom(string memory _str) private view returns (uint) {
      uint rand = uint(keccak256(abi.encodePacked(_str,block.difficulty)));
      return rand % totalMovie;
  }
  
}