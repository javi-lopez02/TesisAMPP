export const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-[13px] text-[#0e1f4d] outline-none transition
   placeholder:text-gray-300
   dark:bg-black/3 dark:text-gray-500 dark:placeholder:text-white/20
   ${
     hasError
       ? "border-[#F09595] bg-[#FCEBEB] focus:border-[#CC1A2E] dark:bg-[#CC1A2E]/10"
       : "border-black/[0.10] bg-white focus:border-[#1B3D8F] dark:border-white/10 dark:focus:border-[#85B7EB]"
   }`;