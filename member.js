<form class="w-full max-w-xl mx-auto bg-gray-900 rounded-2xl border border-gray-600 overflow-hidden p-6">
  <div class="text-white text-xl font-bold font-nunito">Add New Member</div>

  <div class="mt-6 space-y-2">
    <label class="block text-gray-300 text-base font-inter">Name</label>
    <input
      type="text"
      name="name"
      class="w-full h-12 rounded-lg border border-gray-400 bg-transparent p-3 text-white"
      required
    />
  </div>

  <div class="mt-6 space-y-2">
    <label class="block text-gray-300 text-base font-inter">Skills</label>
    <input
      type="text"
      name="skills"
      class="w-full h-12 rounded-lg border border-gray-400 bg-transparent p-3 text-white"
      required
    />
  </div>

  <div class="mt-6 space-y-2">
    <label class="block text-gray-300 text-base font-inter">
      Experience (Years)
    </label>
    <input
      type="number"
      name="experience"
      class="w-full h-12 rounded-lg border border-gray-400 bg-transparent p-3 text-white"
      required
    />
  </div>

  <div class="mt-6 space-y-2">
    <label class="block text-gray-300 text-base font-inter">Bio</label>
    <textarea
      name="bio"
      class="w-full h-32 rounded-lg border border-gray-400 bg-transparent p-3 text-white"
      required
    ></textarea>
  </div>

  <button
    type="submit"
    class="w-full mt-6 py-3 bg-white text-gray-900 font-bold font-nunito text-base rounded-lg hover:bg-gray-200"
  >
    Save Member
  </button>
</form>;
