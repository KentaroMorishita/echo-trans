export const checkApiKey = async <T>(apiKey: string, data: T) => {
  if (!apiKey) {
    alert("Please enter the API Key")
    throw new Error("API Key is required")
  }

  return data
}
