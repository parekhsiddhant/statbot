import generateEmbedding from "../utils/embed";
import APIResponse from "../helpers/apiResponse";

const generateFileEmbeddings = [
  async (req: any, res: any) => {
    try {
      const { inputFileName, client } = req.body;
      await generateEmbedding(inputFileName, client);

      return APIResponse.successResponseWithData(
        res,
        "Successfully completed!",
        {}
      );
    } catch (err: any) {
      console.log("Error - ", err.message);
    }
  },
];
export { generateFileEmbeddings };
